use super::model::LoggedUser;
use crate::errors::ServiceError;


// pub fn verify(user: &User, password: &str) -> bool {
//     let User { hash, salt, .. } = user;

//     make_hash(password, salt) == hash.as_ref()
// }

pub fn has_role(_user: &LoggedUser, _role: &str) -> Result<bool, ServiceError> {
    Ok(true)
    // match user.0 {
    //     Some(ref user) if user.role == role => Ok(true),
    //     _ => Err(ServiceError::Unauthorized),
    // }
}
