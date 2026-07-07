window.SAMHO_SUPABASE = {
  url: "https://tdbuvnzwrakywtvnnewl.supabase.co/rest/v1",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYnV2bnp3cmFreXd0dm5uZXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzUzMDMsImV4cCI6MjA5ODU1MTMwM30.bPOwUhNdDWyij1-mDe3uxvvQaSlAQ3_qr8f4OUQklss",
  table: "machine_info",
  codeColumn: "ITEM_CODE",
  selectColumns: ["*"],
  noteFields: ["machinePlace", "machinePlant", "machineLine", "machineSection"],
  repairRecords: {
    table: "repair_records",
    insertMap: {
      brokenAt: "reported_at",
      repairStartedAt: "repaired_at",
      repairFinishedAt: "repair_completed_at",
      itemCode: "machine_id",
      issue: "issue",
      other: "other_issue",
      reason: "reason",
      solve: "solve",
      mechanic: "technician"
    }
  },
  repairInfo: {
    table: "repair_info",
    dateColumn: "reported_at",
    idColumn: "id",
    updateMap: {
      reportedAt: "reported_at",
      repairStartedAt: "",
      repairedAt: "repaired_at",
      issue: "issue",
      other: "other_issue",
      reason: "reason",
      solve: "solve",
      technician: "technician"
    }
  },
  summaryReport: {
    powerBiUrl: "https://app.powerbi.com/view?r=eyJrIjoiNTlhNTQ0MjktYzg2My00ZTNmLTk1YjktNWFmNmFhYmFhYTcxIiwidCI6IjA1OWEyZmU4LTA0NDgtNGIwMi04YTBlLWEyOTAwM2IxZmNlNyIsImMiOjEwfQ%3D%3D"
  },
  downtime: {
    table: "downtime",
    fieldMap: {
      itemCode: "item_code",
      machineName: "name_en",
      section: "section",
      plant: "place2",
      totalDowntime: "total_downtime",
      month: "month",
      errorCount: "",
      mttr: "",
      mtbf: ""
    }
  },
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
