namespace my.employees;

entity Employees {
  key ID       : Integer;
      name     : localized String;
      location : Association to Locations;
      category : Association to Categories;
      photo    : String;
      age      : UInt8;
      salary   : Integer;
      City     : String;
      Adress   : String;
}

@assert.unique: {isbn: [title]}
entity Locations {
  key ID        : Integer;
      title     : localized String;
      employees : Association to many Employees
                    on employees.location = $self;
}

@assert.unique: {isbn: [title]}
entity Categories {
  key ID        : Integer;
      title     : localized String;
      employees : Association to many Employees
                    on employees.category = $self;
}
