using my.employees as my from '../db/schema';

service Service {
  entity Employees as projection on my.Employees;
  entity Locations as projection on my.Locations;
  entity Categories as projection on my.Categories;
}