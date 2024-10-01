sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
  "use strict";

  return {
    deleteEmployee: function (oModel, oBundle, employeeId) {
      oModel.remove(`/Employees(${encodeURIComponent(employeeId)})`, {
        success: function () {
          MessageBox.success(oBundle.getText("delete-sucess"));
        },
        error: function () {
          MessageBox.error(oBundle.getText("delete-error"));
        },
      });
    },

    getEmployeeById: function (oModel, employeeId) {
      return new Promise((resolve, reject) => {
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
    },

    updateEmployee: function (oModel, oBundle, updatedData, employeeId) {
      if (
        !(
          updatedData.name &&
          updatedData.location.title &&
          updatedData.category.title
        )
      ) {
        return MessageBox.error(oBundle.getText("fill-required"));
      }

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
      this.updateEmployeeMain(oModel, employeeId, employeeUpdate)
        .then(() => {
          return this.updateOrCreateLocation(
            oModel,
            employeeId,
            updatedData.location.title
          );
        })
        .then(() => {
          return this.updateOrCreateCategory(
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

    updateEmployeeMain: function (oModel, employeeId, data) {
      return new Promise((resolve, reject) => {
        oModel.update(`/Employees(${employeeId})`, data, {
          success: resolve,
          error: reject,
        });
      });
    },

    updateOrCreateLocation: function (oModel, employeeId, locationTitle) {
      return new Promise((resolve, reject) => {
        oModel.read("/Locations", {
          urlParameters: {
            $filter: `title eq '${encodeURIComponent(locationTitle)}'`,
          },
          success: (oData) => {
            // If location exists
            if (oData.results && oData.results.length > 0) {
              this.updateEmployeeMain(oModel, employeeId, {
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
                    console.log("Location created:", oData);
                    this.updateEmployeeMain(oModel, employeeId, {
                      location_ID: oData.results[0].lastInsertRowid,
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

    updateOrCreateCategory: function (oModel, employeeId, categoryTitle) {
      return new Promise((resolve, reject) => {
        oModel.read("/Categories", {
          urlParameters: {
            $filter: `title eq '${encodeURIComponent(categoryTitle)}'`,
          },
          success: (oData) => {
            if (oData.results && oData.results.length > 0) {
              // If category exists
              this.updateEmployeeMain(oModel, employeeId, {
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
                    this.updateEmployeeMain(oModel, employeeId, {
                      category_ID: oData.results[0].lastInsertRowid,
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
  };
});
