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
      totalDowntime: "total_downtime",
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
      month: "",
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
  },
  pm: {
    defaultIntervalDays: 30,
    defaultTeam: ["LEAN TECH"],
    validatorTeam: ["LEAD TECH", "25102801", "21051708"],
    tasksTable: "pm_tasks",
    taskFields: {
      equipment: "equipment",
      machineName: "machine_name",
      taskNo: "task_no",
      taskName: "task_name",
      itemGroup: "item_group",
      itemTask: "item_task",
      frequency: "frequency",
      taskDetail: "task_detail"
    },
    recordsTable: {
      table: "pm_records",
      fieldMap: {
        id: "id",
        itemCode: "item_code",
        plant: "plant",
        pic: "pic",
        status: "status",
        dueDate: "due_date",
        technician: "technician",
        notes: "notes",
        recordType: "record_type",
        taskProgress: "task_progress",
        taskValidation: "task_validation"
      }
    },
    equipmentMap: {
      "ATOM FLASHCUT": ["ATOM-A01","ATOM-A02","ATOM-A03","ATOM-A04","ATOM-A05","ATOM-A06","ATOM-A07","ATOM-B01","ATOM-B02","ATOM-B03","ATOM-B04","ATOM-B05","ATOM-B06"],
      "EM CUTTING MACHINE": ["EMCUT-C01","EMCUT-C02"],
      "AUTO MARKING LINER": ["MARK-L01","MARK-L02"],
      "SEMI CUTTING": ["SEMI-C01"],
      "AUTO LASER HOLE PUNCHING MC": ["LASERH-D01"],
      "SOCKLINER": ["SOCK-I01","SOCK-I02"]
    },
    machines: [
      { itemCode: "LASER-D01", equipment: "Laser D01", plant: "Plant D", section: "LASER PUNCHING" },
      { itemCode: "LASER-D02", equipment: "Laser D02", plant: "Plant D", section: "LASER PUNCHING" },
      { itemCode: "LASER-D03", equipment: "Laser D03", plant: "Plant D", section: "LASER PUNCHING" },
      { itemCode: "LASER-D04", equipment: "Laser D04", plant: "Plant D", section: "LASER PUNCHING" },
      { itemCode: "LINE-A01", equipment: "LINE A01", plant: "Plant D", section: "AUTO LINE MARKING" },
      { itemCode: "LINE-A02", equipment: "LINE A02", plant: "Plant D", section: "AUTO LINE MARKING" },
      { itemCode: "LINE-B03", equipment: "LINE B03", plant: "Plant D", section: "AUTO LINE MARKING" },
      { itemCode: "VAMP-A01", equipment: "Vamp A01", plant: "Plant D", section: "VAMP CUTTING" },
      { itemCode: "VAMP-A02", equipment: "Vamp A02", plant: "Plant D", section: "VAMP CUTTING" },
      { itemCode: "VAMP-A03", equipment: "Vamp A03", plant: "Plant D", section: "VAMP CUTTING" },
      { itemCode: "VAMP-A04", equipment: "Vamp A04", plant: "Plant D", section: "VAMP CUTTING" },
      { itemCode: "VAMP-B01", equipment: "Vamp B01", plant: "Plant D", section: "VAMP CUTTING" },
      { itemCode: "VAMP-B02", equipment: "Vamp B02", plant: "Plant D", section: "VAMP CUTTING" },
      { itemCode: "ATOM-A01", equipment: "Atom A01", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-A02", equipment: "Atom A02", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-A03", equipment: "Atom A03", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-A04", equipment: "Atom A04", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-A05", equipment: "Atom A05", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-A06", equipment: "Atom A06", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-A07", equipment: "Atom A07", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-B01", equipment: "Atom B01", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-B02", equipment: "Atom B02", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-B03", equipment: "Atom B03", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-B04", equipment: "Atom B04", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-B05", equipment: "Atom B05", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "ATOM-B06", equipment: "Atom B06", plant: "Plant D", section: "ATOM FLASHCUT" },
      { itemCode: "INSOLE-I01", equipment: "Insole I01", plant: "Plant I", section: "INSOLE PRESSING" },
      { itemCode: "INSOLE-I02", equipment: "Insole I02", plant: "Plant I", section: "INSOLE PRESSING" },
      { itemCode: "EMCUT-C01", equipment: "EM CUT M/C 01", plant: "Plant D", section: "EM CUTTING" },
      { itemCode: "EMCUT-C02", equipment: "EM CUT M/C 02", plant: "Plant D", section: "EM CUTTING" },
      { itemCode: "MARK-L01", equipment: "Marking Liner 01", plant: "Plant D", section: "MARKING LINER" },
      { itemCode: "MARK-L02", equipment: "Marking Liner 02", plant: "Plant D", section: "MARKING LINER" },
      { itemCode: "SEMI-C01", equipment: "Semi Cutting 01", plant: "Plant D", section: "SEMI CUTTING" },
      { itemCode: "LASERH-D01", equipment: "Laser Hole Punch 01", plant: "Plant D", section: "LASER HOLE PUNCHING" },
      { itemCode: "SOCK-I01", equipment: "Sockliner 01", plant: "Plant I", section: "SOCKLINER" },
      { itemCode: "SOCK-I02", equipment: "Sockliner 02", plant: "Plant I", section: "SOCKLINER" }
    ]
  }
};
