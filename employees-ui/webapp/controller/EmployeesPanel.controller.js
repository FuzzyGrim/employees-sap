sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, JSONModel, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ui.quickstart.controller.EmployeesPanel", {
      onPress: function (oEvent) {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("detail", {
          employeePath: window.encodeURIComponent(
            oEvent.getSource().data("employeeId")
          ),
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
        var oModel = this.getOwnerComponent().getModel("service");

        oModel.remove(`/Employees(${encodeURIComponent(employeeId)})`, {
          success: function () {
            MessageBox.success(oBundle.getText("delete-sucess"));
          },
          error: function () {
            MessageBox.error(oBundle.getText("delete-error"));
          },
        });
      },

      onEditPress: async function (oEvent) {
        var employeeId = oEvent.getSource().data("employeeId");
        var oModel = this.getView().getModel("service");

        var employee = await new Promise((resolve, reject) => {
          oModel.read(`/Employees(${employeeId})`, {
            urlParameters: {
              $expand: "location,category",
            },
            success: function (oData) {
              resolve(oData);
            },
            error: function (oError) {
              reject(oError);
            },
          });
        });

        this._oDialog ??= await this.loadFragment({
          name: "ui5.quickstart.view.EmployeeDialog",
        });
        this._oDialog.setModel(new JSONModel(employee), "employee");
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
        var oModel = this.getView().getModel("service");
        var updatedData = this._oDialog.getModel("employee").getData();

        if (
          !(
            updatedData.name &&
            updatedData.location.title &&
            updatedData.category.title
          )
        ) {
          return MessageBox.error("Please fill all required fields");
        }

        const oBundle = this.getView().getModel("i18n").getResourceBundle();

        // Prepare the main employee update data
        var employeeUpdate = {
          name: updatedData.name,
          photo: updatedData.photo,
          age: updatedData.age,
          salary: updatedData.salary,
          city: updatedData.city,
          address: updatedData.address,
        };

        // Perform the update chain: main data, then location, then category
        this._updateEmployeeMain(oModel, employeeId, employeeUpdate)
          .then(() => {
            return this._updateOrCreateLocation(
              oModel,
              employeeId,
              updatedData.location.title
            );
          })
          .then(() => {
            return this._updateOrCreateCategory(
              oModel,
              employeeId,
              updatedData.category.title
            );
          })
          .then(() => {
            MessageBox.success(oBundle.getText("modify-sucess"));
          })
          .catch((error) => {
            console.error("Error updating employee:", error);
            MessageBox.error(oBundle.getText("modify-error"));
          });
      },

      _updateEmployeeMain: function (oModel, employeeId, data) {
        return new Promise((resolve, reject) => {
          oModel.update(`/Employees(${employeeId})`, data, {
            success: resolve,
            error: reject,
          });
        });
      },

      _updateOrCreateLocation: function (oModel, employeeId, locationTitle) {
        return new Promise((resolve, reject) => {
          oModel.read("/Locations", {
            urlParameters: {
              $filter: `title eq '${encodeURIComponent(locationTitle)}'`,
            },
            success: (oData) => {
              // If location exists
              if (oData.results && oData.results.length > 0) {
                this._updateEmployeeMain(oModel, employeeId, {
                  location_ID: oData.results[0].ID,
                })
                  .then(resolve)
                  .catch(reject);
              } else {
                oModel.create(
                  "/Locations",
                  { title: locationTitle },
                  {
                    success: (oData) => {
                      this._updateEmployeeMain(oModel, employeeId, {
                        location_ID: oData.ID,
                      })
                        .then(resolve)
                        .catch(reject);
                    },
                    error: reject,
                  }
                );
              }
            },
            error: reject,
          });
        });
      },

      _updateOrCreateCategory: function (oModel, employeeId, categoryTitle) {
        return new Promise((resolve, reject) => {
          oModel.read("/Categories", {
            urlParameters: {
              $filter: `title eq '${encodeURIComponent(categoryTitle)}'`,
            },
            success: (oData) => {
              if (oData.results && oData.results.length > 0) {
                // If category exists
                this._updateEmployeeMain(oModel, employeeId, {
                  category_ID: oData.results[0].ID,
                })
                  .then(resolve)
                  .catch(reject);
              } else {
                oModel.create(
                  "/Categories",
                  { title: categoryTitle },
                  {
                    success: (oData) => {
                      this._updateEmployeeMain(oModel, employeeId, {
                        category_ID: oData.ID,
                      })
                        .then(resolve)
                        .catch(reject);
                    },
                    error: reject,
                  }
                );
              }
            },
            error: reject,
          });
        });
      },

      onFilterEmployees: function (oEvent) {
        // build filter array
        const aFilter = [];
        const sQuery = oEvent.getParameter("query");
        if (sQuery) {
          aFilter.push(new Filter("name", FilterOperator.Contains, sQuery));
        }

        // filter binding
        const oList = this.byId("employeesTable");
        const oBinding = oList.getBinding("items");
        oBinding.filter(aFilter);
      },
    });
  }
);
