use std::fs::File;

// See https://exiftool.org/TagNames/EXIF.html for EXIF format info
use exif::{Exif, In, Tag, Value};

pub fn get_exif(file: &File) -> Exif {
  let mut bufreader = std::io::BufReader::new(file);
  exif::Reader::new()
    .read_from_container(&mut bufreader)
    .expect("Cannot parse EXIF data")
}

pub fn get_shot_at(exif: &Exif) -> Option<chrono::NaiveDateTime> {
  exif
    .get_field(Tag::DateTimeOriginal, In::PRIMARY)
    .map(|f| match f.value {
      Value::Ascii(ref v) => exif::DateTime::from_ascii(&v[0]).ok().map(|dt| {
        chrono::NaiveDate::from_ymd(dt.year as i32, dt.month as u32, dt.day as u32).and_hms(
          dt.hour as u32,
          dt.minute as u32,
          dt.second as u32,
        )
      }),
      _ => None,
    })
    .flatten()
}

pub fn get_shot_with_fstop(exif: &Exif) -> Option<String> {
  exif
    .get_field(Tag::FNumber, In::PRIMARY)
    .map(|ref f| match f.value {
      Value::Rational(ref v) => Some(v[0].to_f64().to_string()),
      _ => None,
    })
    .flatten()
}

pub fn get_shot_with_focal_length(exif: &Exif) -> Option<i32> {
  exif
    .get_field(Tag::FocalLength, In::PRIMARY)
    .map(|f| match f.value {
      Value::Rational(ref v) => Some(v[0].to_f64() as i32),
      _ => None,
    })
    .flatten()
}

pub fn get_shot_with_exposure_time(exif: &Exif) -> Option<String> {
  exif
    .get_field(Tag::ExposureTime, In::PRIMARY)
    .map(|f| match f.value {
      Value::Rational(ref v) => Some(v[0].to_f64().to_string()),
      _ => None,
    })
    .flatten()
}

pub fn get_shot_with_iso(exif: &Exif) -> Option<i32> {
  exif
    .get_field(Tag::PhotographicSensitivity, In::PRIMARY)
    .map(|f| match f.value {
      Value::Short(ref v) => Some(v[0] as i32),
      _ => None,
    })
    .flatten()
}

pub fn get_shot_by_camera_lens_name(exif: &Exif) -> Option<&str> {
  exif
    .get_field(Tag::LensModel, In::PRIMARY)
    .map(|f| match f.value {
      Value::Ascii(ref v) => {
        Some(std::str::from_utf8(&v[0]).expect("Unexpected characters in LensModel EXIF field"))
      }
      _ => None,
    })
    .flatten()
}
