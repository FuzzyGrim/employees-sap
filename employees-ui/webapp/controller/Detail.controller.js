sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "./ODataService",
  ],
  (Controller, JSONModel, History, ODataService) => {
    "use strict";

    return Controller.extend("ui5.quickstart.controller.Detail", {
      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("detail")
          .attachPatternMatched(this.onObjectMatched, this);
      },

      onObjectMatched(oEvent) {
        const employeeId = oEvent.getParameter("arguments").employeeId;
        this._loadEmployeeData(employeeId);
      },

      _loadEmployeeData(employeeId) {
        const oModel = this.getOwnerComponent().getModel("service");

        ODataService.getEmployeeById(oModel, employeeId)
          .then((oData) => {
            const oEmployeeModel = new JSONModel(oData);
            this.getView().setModel(oEmployeeModel, "employee");
          })
          .catch((oError) => {
            console.error("Error loading employee data:", oError);
          });
      },

      onNavBack() {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("overview", {}, true);
        }
      },
    });
  }
);
