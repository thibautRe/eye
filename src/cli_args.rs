use clap::{Args, Parser, Subcommand};

#[derive(Parser, Debug, Clone)]
#[clap(name = "eye")]
pub struct Opt {
  #[clap(subcommand)]
  pub command: Commands,

  /// Database URL
  #[clap(long, env = "DATABASE_URL")]
  pub database_url: String,

  /// Path to extract pictures from
  #[clap(long, env = "EXTRACT_FROM")]
  pub extract_from: String,

  #[clap(long, env = "EYE_CACHE_FILES", default_value = ".eye_cache")]
  pub cache_path: String,
}

#[derive(Debug, Subcommand, Clone)]
pub enum Commands {
  /// Start server
  Serve(ServeArgs),

  /// Run picture extraction process
  ExtractPictures,
}

#[derive(Debug, Args, Clone)]
pub struct ServeArgs {
  /// Port to listen to
  #[clap(short, long, env = "PORT", default_value = "3000")]
  pub port: u16,

  /// host
  #[clap(long, env = "HOST", default_value = "localhost")]
  pub host: String,

  /// JWT secret
  #[clap(long, env = "JWT_SECRET")]
  pub jwt_secret: String,

  /// Prevent any JWT check from running
  /// Can be useful to generate JWT tokens using the secret passed
  #[clap(long)]
  pub unsafe_no_jwt_checks: bool,
}
