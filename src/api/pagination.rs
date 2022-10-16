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
}

#[derive(Debug, Clone, Copy, QueryId)]
pub struct Paginated<T> {
  query: T,
  page: i64,
  per_page: i64,
  offset: i64,
}

impl<T> Paginated<T> {
  pub fn per_page(self, per_page: Option<i64>, max: i64) -> Self {
    match per_page {
      None => self,
      Some(per_page) => {
        let per_page = std::cmp::min(per_page, max);
        Paginated {
          per_page,
          offset: (self.page - 1) * per_page,
          ..self
        }
      }
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
  total_count: i64,
  total_pages: i64,
  next_page: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedApi<T> {
  pub items: Vec<T>,
  pub info: PaginatedInfo,
}