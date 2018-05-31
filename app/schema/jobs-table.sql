create table if not exists jobs (
  id int(10) primary key auto_increment,
  foreign key (order_id)
    references orders(id),
  foreign key (job_type_id)
    references jobtypes(id),
  foreign key (job_quality)
    references jobqualities(id),
  size varchar(32),
  quantity int(10),
  rate int(10),
  amount int(10),
  foreign key (feature_id)
    references features(id)
) Engine=InnoDB;
