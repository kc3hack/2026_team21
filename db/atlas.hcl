env "local" {
  url = "postgres://charm:charm@127.0.0.1:5432/charm?sslmode=disable"
  dev = "docker://postgres/16/dev"

  schema {
    src = ["./db/schema.sql"]
  }

  migration {
    dir = "file://db/migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
