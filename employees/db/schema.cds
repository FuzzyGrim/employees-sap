namespace my.employees;

entity Employees {
  key ID   : Integer;
  name     : localized String;
  location : Association to Locations;
  category : Association to Categories;
  photo    : String;
  age      : UInt8;
  salary   : Integer;
  City     : String;
  Adress   : String;
}

entity Locations {
  key ID : Integer;
  title   : String;
  employees  : Association to many Employees on employees.location = $self;
}

entity Categories {
  key ID  : Integer;
  title   : String;
  employees  : Association to many Employees on employees.category = $self;
}
