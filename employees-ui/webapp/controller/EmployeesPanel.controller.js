sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (Controller, JSONModel, MessageBox) {
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

        const oBundle = this.getView().getModel("i18n").getResourceBundle();
        MessageBox.confirm(oBundle.getText("delete-confirm"), {
          title: oBundle.getText("delete-title"),
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              that._deleteEmployee(employeeId);
            }
          },
        });
      },

      _deleteEmployee: function (employeeId) {
        const oBundle = this.getView().getModel("i18n").getResourceBundle();

        fetch(`/odata/v4/Employees(${employeeId})`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              // Refresh the data after successful deletion
              this._loadEmployeeData();
              MessageBox.success(oBundle.getText("delete-sucess"));
            } else {
              throw new Error("Delete operation failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting employee:", error);
            MessageBox.error(oBundle.getText("delete-error"));
          });
      },

      onEditPress: async function (oEvent) {
        var employeeId = oEvent.getSource().data("employeeId");
        var oModel = this.getView().getModel("employeeModel");
        var employee = oModel
          .getProperty("/value")
          .find((e) => e.ID === employeeId);

        this._oDialog ??= await this.loadFragment({
          name: "ui5.quickstart.view.EmployeesDialog",
        });

        this._oDialog.setModel(new JSONModel(employee));
        this._oDialog.open();
      },

      onCancelDialogPress: function () {
        this._oDialog.close();
      },

      onSaveDialogPress: function (oEvent) {
        var employeeId = oEvent.getSource().data("employeeId");
        this._updateEmployee(employeeId);
        this._oDialog.close();
      },

      _updateEmployee: function (employeeId) {
        var oModel = this._oDialog.getModel();
        var updatedData = oModel.getData();
        const oBundle = this.getView().getModel("i18n").getResourceBundle();

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
            MessageBox.success(oBundle.getText("modify-sucess"));
          })
          .catch((error) => {
            console.error("Error updating employee:", error);
            MessageBox.error(oBundle.getText("modify-error"));
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
