use structopt::StructOpt;

/// Juniper (GraphQl API), Diesel PostgreSQL, session authentication and JWT boilerplate server
#[derive(StructOpt, Debug, Clone)]
#[structopt(name = "canduma")]
pub(crate) struct Opt {
    /// Port to listen to
    #[structopt(short, long, env = "PORT", default_value = "3000")]
    pub port: u16,

    /// host
    #[structopt(long, env = "HOST", default_value = "localhost")]
    pub host: String,

    /// Database URL
    #[structopt(long, env = "DATABASE_URL")]
    pub database_url: String,
}
