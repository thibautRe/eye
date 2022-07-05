use crate::graphql::model::Context;

pub(crate) struct Mutation;

#[juniper::object(Context = Context)]
impl Mutation {
  pub fn double(number: i32) -> i32 {
    number * 2
  }
}
