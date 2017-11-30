# Charset And Collation

## List All Collations

```SQL
SHOW CHARACTER SET;

SHOW COLLATION;
```

## Collation Case Sensitivity Suffixes

| Suffix | Meaning |
| :----: | :-----: |
| _ci | Case insensitive |
| _cs | Case sensitive |
| _bin | Binary |

## UTF8 Collation

* utf8_bin

* utf8_general_ci

    默认UTF8的默认Collation，大小写不敏感，即`utf8 - default collation`

## References

> http://dev.mysql.com/doc/refman/5.7/en/charset.html
