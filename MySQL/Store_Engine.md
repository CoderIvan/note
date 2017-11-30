# MySQL Storage Engine

---

## InnoDB与MyISAM的区别

#### [InnoDB](http://dev.mysql.com/doc/refman/5.7/en/innodb-introduction.html)

* Storage limits: **64TB**
* Transcations: **Yes**
* Locking granularity: **Row**
* Foreign key support: **Yes**
* Data caches: **Yes**

#### [MyISAM](http://dev.mysql.com/doc/refman/5.7/en/myisam-storage-engine.html)

* Storage limits: **256TB**
* Transcations: **No**
* Locking granularity: **Table**
* Foreign key support: **No**
* Data caches: **No**

## 个人心得
* MyISAM偏向于查密集的场景
* InnoDB偏向于增删改密集的场景
