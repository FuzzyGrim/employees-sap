using my.employees as my from '../db/schema';

service CatalogService {
  entity Employees as projection on my.Employees;
  entity Locations @readonly as projection on my.Locations;
  entity Categories @insertonly as projection on my.Categories;
}