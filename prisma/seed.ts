// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.maintenanceRequest.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.equipmentCategory.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.maintenanceTeam.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  console.log("✅ Data cleared");

  // Create Departments
  const productionDept = await prisma.department.create({
    data: { name: "Production" },
  });

  const itDept = await prisma.department.create({
    data: { name: "IT" },
  });

  const maintenanceDept = await prisma.department.create({
    data: { name: "Maintenance" },
  });

  console.log("✅ Departments created");

  // Create Users
  const admin = await prisma.employee.create({
    data: {
      name: "Admin User",
      email: "admin@gearguard.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      departmentId: maintenanceDept.id,
    },
  });

  const manager = await prisma.employee.create({
    data: {
      name: "John Manager",
      email: "manager@gearguard.com",
      password: await bcrypt.hash("manager123", 10),
      role: "MANAGER",
      departmentId: productionDept.id,
    },
  });

  const user = await prisma.employee.create({
    data: {
      name: "Jane User",
      email: "user@gearguard.com",
      password: await bcrypt.hash("user123", 10),
      role: "USER",
      departmentId: productionDept.id,
    },
  });

  console.log("✅ Users created");

  // Create Maintenance Teams
  const mechanicsTeam = await prisma.maintenanceTeam.create({
    data: { name: "Mechanics" },
  });

  const electricalTeam = await prisma.maintenanceTeam.create({
    data: { name: "Electrical Team" },
  });

  const itTeam = await prisma.maintenanceTeam.create({
    data: { name: "IT Support" },
  });

  console.log("✅ Maintenance teams created");

  // Create Technicians
  const techEmployee1 = await prisma.employee.create({
    data: {
      name: "Mike Technician",
      email: "tech@gearguard.com",
      password: await bcrypt.hash("tech123", 10),
      role: "TECHNICIAN",
      departmentId: maintenanceDept.id,
    },
  });

  const technician1 = await prisma.technician.create({
    data: {
      employeeId: techEmployee1.id,
      maintenanceTeamId: mechanicsTeam.id,
    },
  });

  const techEmployee2 = await prisma.employee.create({
    data: {
      name: "Sarah Electrician",
      email: "electrician@gearguard.com",
      password: await bcrypt.hash("tech123", 10),
      role: "TECHNICIAN",
      departmentId: maintenanceDept.id,
    },
  });

  await prisma.technician.create({
    data: {
      employeeId: techEmployee2.id,
      maintenanceTeamId: electricalTeam.id,
    },
  });

  console.log("✅ Technicians created");

  // Create Equipment Categories
  const cncCategory = await prisma.equipmentCategory.create({
    data: { name: "CNC Machines" },
  });

  const computersCategory = await prisma.equipmentCategory.create({
    data: { name: "Computers" },
  });

  const vehiclesCategory = await prisma.equipmentCategory.create({
    data: { name: "Vehicles" },
  });

  console.log("✅ Equipment categories created");

  // Create Equipment
  await prisma.equipment.create({
    data: {
      name: "CNC Mill 001",
      serialNumber: "CNC-001-2023",
      categoryId: cncCategory.id,
      departmentId: productionDept.id,
      maintenanceTeamId: mechanicsTeam.id,
      defaultTechnicianId: technician1.id,
      location: "Shop Floor - Bay A",
      purchaseDate: new Date("2023-01-15"),
      warrantyExpiryDate: new Date("2026-01-15"),
    },
  });

  await prisma.equipment.create({
    data: {
      name: "Laptop - Jane",
      serialNumber: "DELL-LAP-2024-001",
      categoryId: computersCategory.id,
      departmentId: productionDept.id,
      assignedEmployeeId: user.id,
      maintenanceTeamId: itTeam.id,
      location: "Office Building - Floor 2",
      purchaseDate: new Date("2024-03-10"),
      warrantyExpiryDate: new Date("2027-03-10"),
    },
  });

  await prisma.equipment.create({
    data: {
      name: "Forklift 05",
      serialNumber: "FLT-005-2022",
      categoryId: vehiclesCategory.id,
      departmentId: productionDept.id,
      maintenanceTeamId: mechanicsTeam.id,
      defaultTechnicianId: technician1.id,
      location: "Warehouse - Loading Dock",
      purchaseDate: new Date("2022-06-20"),
    },
  });

  console.log("✅ Equipment created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Test Accounts:");
  console.log("Admin:      admin@gearguard.com / admin123");
  console.log("Manager:    manager@gearguard.com / manager123");
  console.log("User:       user@gearguard.com / user123");
  console.log("Technician: tech@gearguard.com / tech123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });