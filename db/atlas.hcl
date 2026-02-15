env "local" {
  url = "postgres://example:example@127.0.0.1:5432/example?sslmode=disable"
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
