namespace my.employees;

entity Employees {
  key ID       : Integer;
      name     : localized String not null;
      location : Association to Locations not null;
      category : Association to Categories not null;
      photo    : String;
      age      : UInt8;
      salary   : Integer;
      city     : String;
      address   : String;
}

@assert.unique: {isbn: [title]}
entity Locations {
  key ID        : Integer;
      title     : localized String not null;
      employees : Association to many Employees
                    on employees.location = $self;
}

@assert.unique: {isbn: [title]}
entity Categories {
  key ID        : Integer;
      title     : localized String not null;
      employees : Association to many Employees
                    on employees.category = $self;
}
