sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input"
  ],
  function (Controller, JSONModel, MessageBox, Dialog, Button, Label, Input) {
    "use strict";

    return Controller.extend("ui.quickstart.controller.EmployeeList", {
      onInit: function () {
        var oModel = new JSONModel();
        this.getView().setModel(oModel, "employeeModel");

        this._loadEmployeeData();
      },

      _loadEmployeeData: function () {
        var oModel = this.getView().getModel("employeeModel");

        fetch(
          "http://localhost:4004/odata/v4/catalog/Employees?$expand=location,category"
        )
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
        fetch(
          `http://localhost:4004/odata/v4/catalog/Employees(${employeeId})`,
          {
            method: "DELETE",
          }
        )
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
          this._oDialog = new Dialog({
            title: "Modify Employee",
            content: [
              new Label({ text: "Name" }),
              new Input({ value: "{/name}" }),
              new Label({ text: "Location" }),
              new Input({ value: "{/location/title}" }),
              new Label({ text: "Category" }),
              new Input({ value: "{/category/title}" }),
              new Label({ text: "Photo" }),
              new Input({ value: "{/photo}" }),
              new Label({ text: "Age" }),
              new Input({ value: "{/age}", type: "Number" }),
              new Label({ text: "Salary" }),
              new Input({ value: "{/salary}", type: "Number" }),
              new Label({ text: "City" }),
              new Input({ value: "{/city}" }),
              new Label({ text: "Address" }),
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


      _updateEmployee: function(employeeId) {
        var oModel = this._oDialog.getModel();
        var updatedData = oModel.getData();

        fetch(`http://localhost:4004/odata/v4/catalog/Employees(${employeeId})`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => {
            if (response.ok) {
                this._loadEmployeeData();
                MessageBox.success("Employee updated successfully");
            } else {
                throw new Error('Update operation failed');
            }
        })
        .catch(error => {
            console.error("Error updating employee:", error);
            MessageBox.error("Failed to update employee");
        });
    }
    });
  }
);
