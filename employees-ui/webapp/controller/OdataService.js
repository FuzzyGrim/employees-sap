sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
  "use strict";

  return {
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

    createEmployee: async function (oModel, oBundle, data) {
      const locationId = await this.getOrCreateLocation(
        oModel,
        data.location.title
      );
      const categoryId = await this.getOrCreateCategory(
        oModel,
        data.category.title
      );

      // Now prepare the employee data
      const employeeData = {
        name: data.name,
        photo: data.photo,
        age: data.age,
        salary: data.salary,
        city: data.city,
        address: data.address,
        location_ID: locationId,
        category_ID: categoryId,
      };

      return new Promise((resolve, reject) => {
        oModel.create("/Employees", employeeData, {
          success: function () {
            MessageBox.success(oBundle.getText("create-sucess"));
            resolve();
          },
          error: function (oError) {
            MessageBox.error(oBundle.getText("create-error"));
            reject(oError);
          },
        });
      });
    },

    updateEmployee: async function (oModel, oBundle, data, employeeId) {
      const locationId = await this.getOrCreateLocation(
        oModel,
        data.location.title
      );
      const categoryId = await this.getOrCreateCategory(
        oModel,
        data.category.title
      );

      // Prepare the main employee update data
      const employeeData = {
        name: data.name,
        photo: data.photo,
        age: data.age,
        salary: data.salary,
        city: data.city,
        address: data.address,
        location_ID: locationId,
        category_ID: categoryId,
      };

      return new Promise((resolve, reject) => {
        oModel.update(`/Employees(${employeeId})`, employeeData, {
          success: function () {
            MessageBox.success(oBundle.getText("modify-sucess"));
            resolve();
          },
          error: function (oError) {
            MessageBox.error(oBundle.getText("modify-error"));
            reject(oError);
          },
        });
      });
    },

    getOrCreateLocation: function (oModel, locationTitle) {
      return new Promise((resolve, reject) => {
        oModel.read("/Locations", {
          urlParameters: {
            $filter: `title eq '${encodeURIComponent(locationTitle)}'`,
          },
          success: (oData) => {
            // If location exists
            if (oData.results && oData.results.length > 0) {
              resolve(oData.results[0].ID);
            } else {
              // Create new location
              oModel.create(
                "/Locations",
                { title: locationTitle },
                {
                  success: (oNewData) => {
                    const newLocationId = oNewData.results[0].lastInsertRowid;
                    resolve(newLocationId);
                  },
                  error: (oError) => {
                    reject(oError);
                  },
                }
              );
            }
          },
          error: (oError) => {
            reject(oError);
          },
        });
      });
    },

    getOrCreateCategory: function (oModel, categoryTitle) {
      return new Promise((resolve, reject) => {
        oModel.read("/Categories", {
          urlParameters: {
            $filter: `title eq '${encodeURIComponent(categoryTitle)}'`,
          },
          success: (oData) => {
            // If category exists
            if (oData.results && oData.results.length > 0) {
              resolve(oData.results[0].ID);
            } else {
              // Create new category
              oModel.create(
                "/Categories",
                { title: categoryTitle },
                {
                  success: (oNewData) => {
                    const newCategoryId = oNewData.results[0].lastInsertRowid;
                    resolve(newCategoryId);
                  },
                  error: (oError) => {
                    reject(oError);
                  },
                }
              );
            }
          },
          error: (oError) => {
            reject(oError);
          },
        });
      });
    },

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
  };
});
