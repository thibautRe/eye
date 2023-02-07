use diesel::{
  pg::Pg,
  query_builder::{AstPass, Query, QueryFragment},
  query_dsl::LoadQuery,
  sql_types::BigInt,
  PgConnection, QueryResult, RunQueryDsl,
};

const DEFAULT_PER_PAGE: i64 = 20;

pub trait Paginate: Sized {
  fn paginate(self, page: i64) -> Paginated<Self>;
  fn paginate_option(self, page: Option<i64>) -> Paginated<Self>;
  fn paginate_first_page(self) -> Paginated<Self>;
}

impl<T> Paginate for T {
  fn paginate(self, page: i64) -> Paginated<Self> {
    Paginated {
      query: self,
      per_page: DEFAULT_PER_PAGE,
      page: page,
      offset: (page - 1) * DEFAULT_PER_PAGE,
    }
  }

  /// Returns the first page if page is None
  fn paginate_option(self, page: Option<i64>) -> Paginated<Self> {
    match page {
      None => self.paginate_first_page(),
      Some(page) => self.paginate(page),
    }
  }

  /// Returns the first page for a paginated query
  fn paginate_first_page(self) -> Paginated<Self> {
    self.paginate(1)
  }
}

#[derive(Debug, Clone, Copy, QueryId)]
pub struct Paginated<T> {
  query: T,
  page: i64,
  per_page: i64,
  offset: i64,
}

impl<T> Paginated<T> {
  /// Useful for variable (e.g. client-side controlled) pagination that should
  /// still have an upper bound.
  ///
  /// If the page size is fixed, use `per_page_fixed` instead.
  pub fn per_page(self, per_page: Option<i64>, max: i64) -> Self {
    match per_page {
      None => self,
      Some(per_page) => self.per_page_fixed(std::cmp::min(per_page, max)),
    }
  }

  pub fn per_page_fixed(self, per_page: i64) -> Self {
    Paginated {
      per_page,
      offset: (self.page - 1) * per_page,
      ..self
    }
  }

  pub fn load_and_count_pages<'a, U>(
    self,
    conn: &mut PgConnection,
  ) -> QueryResult<(Vec<U>, PaginatedInfo)>
  where
    Self: LoadQuery<'a, PgConnection, (U, i64)>,
  {
    let per_page = self.per_page;
    let page = self.page;
    let results = self.load::<(U, i64)>(conn)?;
    let total = results.get(0).map(|x| x.1).unwrap_or(0);
    let records = results.into_iter().map(|x| x.0).collect();
    let total_pages = (total as f64 / per_page as f64).ceil() as i64;
    let next_page = if total_pages <= page {
      None
    } else {
      Some(page + 1)
    };
    Ok((
      records,
      PaginatedInfo {
        next_page,
        total_count: total,
        total_pages,
      },
    ))
  }
}

impl<T> QueryFragment<Pg> for Paginated<T>
where
  T: QueryFragment<Pg>,
{
  fn walk_ast<'b>(&'b self, mut out: AstPass<'_, 'b, Pg>) -> QueryResult<()> {
    out.push_sql("SELECT *, COUNT(*) OVER () FROM (");
    self.query.walk_ast(out.reborrow())?;
    out.push_sql(") t LIMIT ");
    out.push_bind_param::<BigInt, _>(&self.per_page)?;
    out.push_sql(" OFFSET ");
    out.push_bind_param::<BigInt, _>(&self.offset)?;
    Ok(())
  }
}

impl<T: Query> Query for Paginated<T> {
  type SqlType = (T::SqlType, BigInt);
}

impl<T> RunQueryDsl<PgConnection> for Paginated<T> {}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedInfo {
  pub total_count: i64,
  pub total_pages: i64,
  pub next_page: Option<i64>,
}

impl PaginatedInfo {
  fn empty() -> Self {
    Self {
      total_count: 0,
      total_pages: 0,
      next_page: None,
    }
  }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedApi<T> {
  pub items: Vec<T>,
  pub info: PaginatedInfo,
}

impl<T> PaginatedApi<T> {
  pub fn empty() -> Self {
    PaginatedApi {
      items: vec![],
      info: PaginatedInfo::empty(),
    }
  }
}
