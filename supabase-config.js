window.SAMHO_SUPABASE = {
  url: "https://tdbuvnzwrakywtvnnewl.supabase.co/rest/v1",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYnV2bnp3cmFreXd0dm5uZXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzUzMDMsImV4cCI6MjA5ODU1MTMwM30.bPOwUhNdDWyij1-mDe3uxvvQaSlAQ3_qr8f4OUQklss",
  table: "machine_info",
  codeColumn: "ITEM_CODE",
  selectColumns: ["*"],
  noteFields: ["machinePlace", "machinePlant", "machineLine", "machineSection"],
  fieldMap: {
    itemCode: "ITEM_CODE",
    machineName: ["NAME_EN", "name_en"],
    specification: "SPECIFICATION",
    madeBy: "MADE_BY",
    machineStatus: "STATUS",
    machinePlant: "PLANT",
    machineLine: "LINE",
    machineSection: "SECTION",
    machinePlace: "PLACE"
  }
};
