sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageBox",
      "sap/m/Dialog",
      "sap/m/Button",
      "sap/m/Label",
      "sap/m/Input",
    ],
    function (Controller, JSONModel, MessageBox, Dialog, Button, Label, Input) {
      "use strict";
  
      return Controller.extend("ui.quickstart.controller.EmployeesPanel", {
        onInit: function () {
          var oModel = new JSONModel();
          this.getView().setModel(oModel, "employeeModel");
          this._loadEmployeeData();
        },
  
        _loadEmployeeData: function () {
          var oModel = this.getView().getModel("employeeModel");
  
          fetch("/odata/v4/Employees?$expand=location,category")
            .then((res) => res.json())
            .then((data) => {
              oModel.setData(data);
            })
            .catch((error) => {
              console.error("Error fetching employee data:", error);
            });
        },
  
        onDeletePress: function (oEvent) {
          var employeeId = oEvent.getSource().data("employeeId");
          var that = this;
  
          MessageBox.confirm("Are you sure you want to delete this employee?", {
            title: "Confirm Deletion",
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                that._deleteEmployee(employeeId);
              }
            },
          });
        },
  
        _deleteEmployee: function (employeeId) {
          fetch(`/odata/v4/Employees(${employeeId})`, {
            method: "DELETE",
          })
            .then((response) => {
              if (response.ok) {
                // Refresh the data after successful deletion
                this._loadEmployeeData();
                MessageBox.success("Employee deleted successfully");
              } else {
                throw new Error("Delete operation failed");
              }
            })
            .catch((error) => {
              console.error("Error deleting employee:", error);
              MessageBox.error("Failed to delete employee");
            });
        },
  
        onEditPress: function (oEvent) {
          var employeeId = oEvent.getSource().data("employeeId");
          var oModel = this.getView().getModel("employeeModel");
          var employee = oModel
            .getProperty("/value")
            .find((e) => e.ID === employeeId);
  
          if (!this._oDialog) {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            this._oDialog = new Dialog({
              title: "Modify Employee",
              content: [
                new Label({ text: oBundle.getText("name") }),
                new Input({ value: "{/name}" }),
                new Label({ text: oBundle.getText("location") }),
                new Input({ value: "{/location/title}" }),
                new Label({ text: oBundle.getText("category") }),
                new Input({ value: "{/category/title}" }),
                new Label({ text: oBundle.getText("photo") }),
                new Input({ value: "{/photo}" }),
                new Label({ text: oBundle.getText("age") }),
                new Input({ value: "{/age}", type: "Number" }),
                new Label({ text: oBundle.getText("salary") }),
                new Input({ value: "{/salary}", type: "Number" }),
                new Label({ text: oBundle.getText("city") }),
                new Input({ value: "{/city}" }),
                new Label({ text: oBundle.getText("address") }),
                new Input({ value: "{/address}" }),
              ],
              beginButton: new Button({
                text: "Save",
                press: function () {
                  this._updateEmployee(employeeId);
                  this._oDialog.close();
                }.bind(this),
              }),
              endButton: new Button({
                text: "Cancel",
                press: function () {
                  this._oDialog.close();
                }.bind(this),
              }),
            });
  
            this.getView().addDependent(this._oDialog);
          }
  
          this._oDialog.setModel(new JSONModel(employee));
          this._oDialog.open();
        },
  
        _updateEmployee: function (employeeId) {
          var oModel = this._oDialog.getModel();
          var updatedData = oModel.getData();
          console.log(updatedData);
  
          // Prepare the main employee update
          var employeeUpdate = {
            name: updatedData.name,
            photo: updatedData.photo,
            age: updatedData.age,
            salary: updatedData.salary,
            City: updatedData.City,
            Adress: updatedData.Adress,
          };
  
          // Start with updating the employee
          this._updateEmployeeMain(employeeId, employeeUpdate)
            .then(() => {
              // If location changed, update or create new location
              if (updatedData.location && updatedData.location.title) {
                return this._updateOrCreateLocation(
                  employeeId,
                  updatedData.location.title
                );
              }
            })
            .then(() => {
              // If category changed, update or create new category
              if (updatedData.category && updatedData.category.title) {
                return this._updateOrCreateCategory(
                  employeeId,
                  updatedData.category.title
                );
              }
            })
            .then(() => {
              this._loadEmployeeData();
              MessageBox.success("Employee updated successfully");
            })
            .catch((error) => {
              console.error("Error updating employee:", error);
              MessageBox.error("Failed to update employee");
            });
        },
  
        _updateEmployeeMain: function (employeeId, data) {
          return fetch(`/odata/v4/Employees(${employeeId})`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }).then((response) => {
            if (!response.ok) throw new Error("Update operation failed");
          });
        },
  
        _updateOrCreateLocation: function (employeeId, locationTitle) {
          // First, search for existing location with the same title
          return fetch(
            `/odata/v4/Locations?$filter=title eq '${encodeURIComponent(
              locationTitle
            )}'`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.value && data.value.length > 0) {
                // Location exists, use its ID
                return this._updateEmployeeMain(employeeId, {
                  location_ID: data.value[0].ID,
                });
              } else {
                // Location doesn't exist, create new one
                return fetch("/odata/v4/Locations", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ title: locationTitle }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    // Link new location to employee
                    return this._updateEmployeeMain(employeeId, {
                      location_ID: data.results[0].lastInsertRowid,
                    });
                  });
              }
            });
        },
  
        _updateOrCreateCategory: function (employeeId, categoryTitle) {
          // First, search for existing category with the same title
          return fetch(
            `/odata/v4/Categories?$filter=title eq '${encodeURIComponent(
              categoryTitle
            )}'`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.value && data.value.length > 0) {
                // Category exists, use its ID
                return this._updateEmployeeMain(employeeId, {
                  category_ID: data.value[0].ID,
                });
              } else {
                // Category doesn't exist, create new one
                return fetch("/odata/v4/Categories", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ title: categoryTitle }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    // Link new category to employee
                    return this._updateEmployeeMain(employeeId, {
                      category_ID: data.results[0].lastInsertRowid,
                    });
                  });
              }
            });
        },
      });
    }
  );
  