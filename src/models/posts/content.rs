#[derive(Debug, Serialize, Deserialize)]
pub struct Root {
  pub children: Vec<Descendant>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Text {
  pub text: String,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Paragraph {
  pub children: Vec<Descendant>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Picture {
  pub picture_id: i32,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Descendant {
  Text(Text),
  Paragraph(Paragraph),
  Picture(Picture),
}

impl Root {
  pub fn empty() -> Self {
    Self {
      children: Vec::new(),
    }
  }
}
