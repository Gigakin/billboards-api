create table if not exists jobtypes (
  id int(10) primary key auto_increment,
  job_type_name varchar(32),
  foreign key (type_feature_id)
    references typefeatures(id)
) Engine=InnoDB;
