--
-- Table: Users
-- Contains information about system users
--
create table if not exists users (
  id int(11) primary key auto_increment,
  firstname varchar(32) not null,
  lastname varchar(32) not null,
  user_role varchar(32) default "frontdesk",
  email varchar(255) unique,
  mobile int(10) unique,
  password varchar(255) not null
) Engine=InnoDB;


--
-- Table: User Roles
-- Contains information about user roles
--
create table if not exists user_roles (
  id int(10) primary key auto_increment,
  user_role varchar(32) not null
) Engine=InnoDB;


--
-- Table: Orders
-- Contains information about orders
--
create table if not exists orders (
  id int(10) primary key auto_increment,
  order_name varchar(50),
  order_date datetime,
  order_delivery_date datetime,
  challan_number int(10),
  foreign key (party_id)
    references parties(id),
  designing boolean default false,
  scanning boolean default false,
  total_size float(4,2),
  reverse_charge boolean default false,
  order_amount float(4,2),
  order_discount_amount float(4,2),
  cgst_rate float(4,2),
  sgst_rate float(4,2),
  igst_rate float(4,2),
  cgst_amount float(4,2),
  sgst_amount float(4,2),
  igst_amount float(4,2),
  order_tax float(4,2),
  order_grand_amount float(4,2),
  reverse_charge_gst float(4,2),
  remarks varchar(80)
) Engine=InnoDB;


--
-- Table: Jobs
-- Contains information about jobs in orders
-- with orderid as a foreign key
--
create table if not exists jobs (
  id int(10) primary key auto_increment,
  foreign key (order_id)
    references orders(id),
  foreign key (job_type_id)
    references job_types(id),
  foreign key (job_quality)
    references jobqualities(id),
  size varchar(32),
  quantity int(10),
  rate int(10),
  amount int(10),
  foreign key (feature_id)
    references features(id)
) Engine=InnoDB;


--
-- Table: Features
-- Contains information about features
--
create table if not exists features (
  id int(10) primary key auto_increment,
  feature_name varchar(32),
  rate int(5),
  foreign key (uom_id)
    references uom(id),
  foreign key (feature_material_mapping_id)
    references feature_material_mapping(id)
) Engine=InnoDB;


--
-- Table: Job Types
-- Contains information about job types
--
create table if not exists job_types (
  id int(10) primary key auto_increment,
  job_type_name varchar(32),
  foreign key (type_feature_id)
    references typefeatures(id)
) Engine=InnoDB;


--
-- Table: Material
-- Contains information about materials
--
create table if not exists materials (
  id int(10) primary key auto_increment,
  material_name varchar(80),
  foreign key (uom_id)
    references uom(id),
  reorder_level varchar(32),
  reorder_quantity int(5)
) Engine=InnoDB;


--
-- Table: Feature and Job Type Mapping
-- Mapping table for features and job types
--
create table if not exists feature_job_type_mapping (
  id int(10) primary key auto_increment,
  foreign key (job_type_id)
    references job_types(id),
  foreign key (feature_id)
    references features(id)
) Engine=InnoDB;

--
-- Table: Feature Material Mapping
-- Mapping table for features and materials
--
create table if not exists feature_material_mapping (
  id int(10) primary key auto_increment,
  foreign key (feature_id)
    references features(id),
  foreign key (material_id)
    referneces materials(id),
  foreign key (uom_id),
    references uom(id)
) Engine=InnoDB;


--
-- Table: Invoice Headers
-- Contains information about invoice headers
--
create table if not exists invoice_headers (
  id int(10) primary key auto_increment,
  invoice_date datetime,
  foreign key (customer_id)
    references customers(id),
  total_amount int(10),
  total_payment int(10),
  total_balance int(10),
  discount_type varchar(32),
  discount_percentage int(5),
  discount_amount int(5),
  tax_percentage int(5),
  tax_amount int(5),
  tax_description varchar(80),
  final_total_amount int(10),
  date_added datetime,
  date_updated datetime,
  added_by int(5),   -- FOREIGN KEY OF WHAT?
  updated_by int(5),  -- FOREIGN KEY OF WHAT?
  challan_no varchar(32),
  challan_date datetime
) Engine=InnoDB;
