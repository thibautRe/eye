use clap::Parser;

#[derive(Parser, Debug, Clone)]
#[clap(name = "eye")]
pub struct Opt {
  /// Port to listen to
  #[clap(short, long, env = "PORT", default_value = "3000")]
  pub port: u16,

  /// host
  #[clap(long, env = "HOST", default_value = "localhost")]
  pub host: String,

  /// Database URL
  #[clap(long, env = "DATABASE_URL")]
  pub database_url: String,

  /// JWT secret
  #[clap(long, env = "JWT_SECRET")]
  pub jwt_secret: String,
}
