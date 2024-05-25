use std::collections::HashSet;

#[derive(Debug, Serialize, Deserialize)]
pub struct Root {
  pub children: Vec<Descendant>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Text {
  pub text: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub bold: Option<bool>,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub italic: Option<bool>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Header {
  /// Between 1 and 6 included
  pub level: u8,
  pub children: Vec<Descendant>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Link {
  /// full href, including protocol
  pub href: String,
  pub children: Vec<Descendant>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Paragraph {
  pub children: Vec<Descendant>,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Picture {
  pub picture_id: i32,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Descendant {
  Text(Text),
  Header(Header),
  Link(Link),
  Paragraph(Paragraph),
  Picture(Picture),
}

impl Root {
  pub fn empty() -> Self {
    Self {
      children: Vec::new(),
    }
  }

  pub fn extract_picture_ids(&self) -> HashSet<i32> {
    extract_picture_ids_descendants(&self.children)
  }
}

fn extract_picture_ids_descendants(descs: &Vec<Descendant>) -> HashSet<i32> {
  descs
    .iter()
    .flat_map(|child| match child {
      Descendant::Text(_text) => HashSet::new(),
      Descendant::Header(h) => extract_picture_ids_descendants(&h.children),
      Descendant::Paragraph(p) => extract_picture_ids_descendants(&p.children),
      Descendant::Link(l) => extract_picture_ids_descendants(&l.children),
      Descendant::Picture(Picture { picture_id }) => {
        let mut set = HashSet::new();
        set.insert(*picture_id);
        set
      }
    })
    .collect()
}
