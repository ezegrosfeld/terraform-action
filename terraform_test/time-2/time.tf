resource "time_offset" "example" {
  offset_days = 3
}

output "one_week_from_now" {
  value = time_offset.example.rfc3339
}
