create table if not exists orders (
  -- Order details
  id int(10) primary key auto_increment,
  order_name varchar(50),
  order_date datetime,
  order_delivery_date datetime,
  challan_number int(10),
  -- Party Details
  foreign key (party_id)
    references parties(id),
  -- Order Details
  designing boolean default false,
  scanning boolean default false,
  total_size float(4,2),
  -- Amount details
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
