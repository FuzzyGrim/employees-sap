sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "./ODataService",
  ],
  function (
    Controller,
    JSONModel,
    MessageBox,
    Filter,
    FilterOperator,
    ODataService
  ) {
    "use strict";

    return Controller.extend("ui.quickstart.controller.EmployeesPanel", {
      _dialogMode: null, // 'create' or 'edit'

      onPress: function (oEvent) {
        const oRouter = this.getOwnerComponent().getRouter();
        const employeeId = oEvent.getSource().data("employeeId");
        oRouter.navTo("detail", {
          employeeId: employeeId,
        });
      },

      onCreatePress: async function () {
        this._dialogMode = "create";
        this._oDialog ??= await this.loadFragment({
          name: "ui5.quickstart.view.EmployeeDialog",
        });

        // Set up a new empty employee model for creation
        let oEmployeeModel = new JSONModel({
          name: "",
          location: { title: "" },
          category: { title: "" },
          photo: "",
          age: null,
          salary: null,
          city: "",
          address: "",
        });
        this._oDialog.setModel(oEmployeeModel, "employee");

        this._oDialog.open();
      },

      onEditPress: async function (oEvent) {
        this._dialogMode = "edit";
        var employeeId = oEvent.getSource().data("employeeId");
        var oModel = this.getView().getModel("service");
        var employee = await ODataService.getEmployeeById(oModel, employeeId);

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
        var oModel = this.getView().getModel("service");
        var data = this._oDialog.getModel("employee").getData();
        const oBundle = this.getView().getModel("i18n").getResourceBundle();

        if (data.name && data.location.title && data.category.title) {
          if (this._dialogMode === "create") {
            ODataService.createEmployee(oModel, oBundle, data);
          } else if (this._dialogMode === "edit") {
            ODataService.updateEmployee(oModel, oBundle, data, employeeId);
          }
        } else {
          MessageBox.error(oBundle.getText("fill-required"));
        }
        this._oDialog.close();
      },

      onDeletePress: function (oEvent) {
        var employeeId = oEvent.getSource().data("employeeId");
        const oBundle = this.getView().getModel("i18n").getResourceBundle();
        var oModel = this.getView().getModel("service");

        MessageBox.confirm(oBundle.getText("delete-confirm"), {
          title: oBundle.getText("delete-title"),
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              ODataService.deleteEmployee(oModel, oBundle, employeeId);
            }
          },
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
