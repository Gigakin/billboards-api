create table if not exists featureJobTypeMapping (
  id int(10) primary key auto_increment,
  foreign key (job_type_id)
    references jobtypes(id),
  foreign key (feature_id)
    references features(id)
) Engine=InnoDB;
