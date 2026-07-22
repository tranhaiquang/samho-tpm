window.SAMHO_SUPABASE = {
  url: "https://tdbuvnzwrakywtvnnewl.supabase.co/rest/v1",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYnV2bnp3cmFreXd0dm5uZXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzUzMDMsImV4cCI6MjA5ODU1MTMwM30.bPOwUhNdDWyij1-mDe3uxvvQaSlAQ3_qr8f4OUQklss",
  table: "repair_records",
  codeColumn: "item_code",
  selectColumns: ["*"],
  machineInfo: {
    table: "machine_info",
    codeColumn: "ITEM_CODE",
    selectColumns: ["*"]
  },
  noteFields: ["machinePlace", "machinePlant", "machineSection"],
  repairRecords: {
    table: "repair_records",
    insertMap: {
      brokenAt: "start_datetime",
      repairStartedAt: "fix_datetime",
      repairFinishedAt: "end_datetime",
      itemCode: "item_code",
      machineName: "name_en",
      machinePlace: "place",
      machinePlant: "plant",
      machineSection: "section",
      totalDowntime: "total_downtime",
      month: "month",
      issue: "issue",
      other: "other_issue",
      reason: "reason",
      solve: "solve",
      mechanic: "technician"
    }
  },
  repairInfo: {
    table: "repair_records",
    dateColumn: "start_datetime",
    idColumn: "id",
    updateMap: {
      reportedAt: "start_datetime",
      repairStartedAt: "fix_datetime",
      repairedAt: "end_datetime",
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
    table: "repair_records",
    fieldMap: {
      itemCode: "item_code",
      machineName: "name_en",
      section: "section",
      plant: "plant",
      totalDowntime: "total_downtime",
      month: "month",
      errorCount: "",
      mttr: "",
      mtbf: ""
    }
  },
  spareParts: {
    table: "spare_parts",
    tableCandidates: ["spare_parts", "sparepart", "spare_part", "Sparepart", "Spare part", "Spare parts"],
    pageSize: 1000,
    imageBucket: "spare_parts_img",
    imagePathPrefix: "",
    imageExtensions: ["jpg", "jpeg", "png", "webp"],
    permissions: {
      table: "spare_part_editors",
      userIdColumn: "user_id",
      emailColumn: "email"
    },
    insertMap: {
      id: "ID",
      plant: "plant",
      itemCode: "item_code",
      nameVietnamese: "name_vietnamese",
      safetyStock: "safety_stock",
      onHand: "on_hand",
      location: "location"
    },
    updateMap: {
      plant: "plant",
      itemCode: "item_code",
      nameVietnamese: "name_vietnamese",
      safetyStock: "safety_stock",
      onHand: "on_hand",
      location: "location"
    },
    fieldMap: {
      id: ["id", "ID"],
      plant: ["plant", "PLANT", "Plant"],
      itemCode: ["item_code", "ITEM_CODE", "Item Code"],
      nameVietnamese: ["name_vietnamese", "NAME_VIETNAMESE", "Name Vietnamese"],
      safetyStock: ["safety_stock", "SAFETY_STOCK", "Safety Stock"],
      onHand: ["on_hand", "ON_HAND", "On Hand"],
      location: ["location", "LOCATION", "Location"]
    }
  },
  redTag: {
    table: "redtag_records",
    insertMap: {
      plant: "plant",
      machineName: "name_en",
      itemCode: "item_code",
      date: "date",
      line: "line",
      status: "status",
      issue: "issue"
    },
    fieldMap: {
      plant: "plant",
      machineName: "name_en",
      itemCode: "item_code",
      date: "date",
      line: "line",
      status: "status",
      issue: "issue"
    }
  },
  fieldMap: {
    itemCode: ["item_code", "ITEM_CODE"],
    machineName: ["name_en", "NAME_EN"],
    specification: "SPECIFICATION",
    madeBy: "MADE_BY",
    machineStatus: "STATUS",
    machinePlant: ["plant", "PLANT"],
    machineSection: ["section", "SECTION"],
    machinePlace: ["place", "PLACE"]
  }
};
