import { describe, it, expect } from "vitest";
import { requireRole, hasPermission } from "@/lib/rbac";

describe("rbac.ts - Role-Based Access Control", () => {
  describe("role hierarchy", () => {
    it("should enforce OWNER > ADMIN > MEMBER > VIEWER hierarchy", () => {
      // OWNER can do everything
      expect(() => requireRole("OWNER", "OWNER")).not.toThrow();
      expect(() => requireRole("OWNER", "ADMIN")).not.toThrow();
      expect(() => requireRole("OWNER", "MEMBER")).not.toThrow();
      expect(() => requireRole("OWNER", "VIEWER")).not.toThrow();

      // ADMIN can do ADMIN and below
      expect(() => requireRole("ADMIN", "ADMIN")).not.toThrow();
      expect(() => requireRole("ADMIN", "MEMBER")).not.toThrow();
      expect(() => requireRole("ADMIN", "VIEWER")).not.toThrow();

      // MEMBER can do MEMBER and below
      expect(() => requireRole("MEMBER", "MEMBER")).not.toThrow();
      expect(() => requireRole("MEMBER", "VIEWER")).not.toThrow();

      // VIEWER can only view
      expect(() => requireRole("VIEWER", "VIEWER")).not.toThrow();
    });
  });

  describe("requireRole()", () => {
    it("should not throw when user has sufficient role", () => {
      expect(() => requireRole("OWNER", "MEMBER")).not.toThrow();
      expect(() => requireRole("ADMIN", "MEMBER")).not.toThrow();
      expect(() => requireRole("MEMBER", "MEMBER")).not.toThrow();
    });

    it("should throw when user lacks required role", () => {
      expect(() => requireRole("VIEWER", "MEMBER")).toThrow(
        "Bạn không có quyền thực hiện thao tác này"
      );
      expect(() => requireRole("MEMBER", "ADMIN")).toThrow(
        "Bạn không có quyền thực hiện thao tác này"
      );
      expect(() => requireRole("ADMIN", "OWNER")).toThrow(
        "Bạn không có quyền thực hiện thao tác này"
      );
    });

    it("should throw for undefined/invalid roles", () => {
      expect(() => requireRole("INVALID_ROLE", "MEMBER")).toThrow(
        "Bạn không có quyền thực hiện thao tác này"
      );
      expect(() => requireRole("", "MEMBER")).toThrow(
        "Bạn không có quyền thực hiện thao tác này"
      );
    });

    it("should throw with Vietnamese error message", () => {
      try {
        requireRole("VIEWER", "OWNER");
        expect.fail("Should have thrown");
      } catch (error) {
        expect((error as Error).message).toContain("không có quyền");
      }
    });

    it("should accept exact role match", () => {
      expect(() => requireRole("OWNER", "OWNER")).not.toThrow();
      expect(() => requireRole("ADMIN", "ADMIN")).not.toThrow();
      expect(() => requireRole("MEMBER", "MEMBER")).not.toThrow();
      expect(() => requireRole("VIEWER", "VIEWER")).not.toThrow();
    });
  });

  describe("hasPermission()", () => {
    it("should return true when user has sufficient role", () => {
      expect(hasPermission("OWNER", "MEMBER")).toBe(true);
      expect(hasPermission("ADMIN", "MEMBER")).toBe(true);
      expect(hasPermission("MEMBER", "MEMBER")).toBe(true);
      expect(hasPermission("VIEWER", "VIEWER")).toBe(true);
    });

    it("should return false when user lacks required role", () => {
      expect(hasPermission("VIEWER", "MEMBER")).toBe(false);
      expect(hasPermission("MEMBER", "ADMIN")).toBe(false);
      expect(hasPermission("ADMIN", "OWNER")).toBe(false);
      expect(hasPermission("VIEWER", "OWNER")).toBe(false);
    });

    it("should handle invalid roles gracefully", () => {
      expect(hasPermission("INVALID_ROLE", "MEMBER")).toBe(false);
      expect(hasPermission("", "MEMBER")).toBe(false);
      expect(hasPermission("INVALID", "ADMIN")).toBe(false);
    });

    it("should not throw exceptions", () => {
      expect(() => hasPermission("INVALID", "MEMBER")).not.toThrow();
      expect(() => hasPermission("VIEWER", "OWNER")).not.toThrow();
    });

    it("should be safe for conditional rendering", () => {
      const userRole = "MEMBER";

      if (hasPermission(userRole, "OWNER")) {
        expect.fail("Should not have owner permission");
      }

      if (hasPermission(userRole, "MEMBER")) {
        expect(true).toBe(true);
      } else {
        expect.fail("Should have member permission");
      }
    });
  });

  describe("use case scenarios", () => {
    it("should support admin check pattern", () => {
      const isAdmin = (userRole: string) => hasPermission(userRole, "ADMIN");

      expect(isAdmin("OWNER")).toBe(true);
      expect(isAdmin("ADMIN")).toBe(true);
      expect(isAdmin("MEMBER")).toBe(false);
      expect(isAdmin("VIEWER")).toBe(false);
    });

    it("should support delete operation authorization", () => {
      const userRole = "ADMIN";
      expect(() => requireRole(userRole, "ADMIN")).not.toThrow();

      const userRole2 = "MEMBER";
      expect(() => requireRole(userRole2, "ADMIN")).toThrow();
    });

    it("should support tiered feature access", () => {
      const features = {
        canView: (role: string) => hasPermission(role, "VIEWER"),
        canEdit: (role: string) => hasPermission(role, "MEMBER"),
        canManage: (role: string) => hasPermission(role, "ADMIN"),
        canOwn: (role: string) => hasPermission(role, "OWNER"),
      };

      const memberRole = "MEMBER";
      expect(features.canView(memberRole)).toBe(true);
      expect(features.canEdit(memberRole)).toBe(true);
      expect(features.canManage(memberRole)).toBe(false);
      expect(features.canOwn(memberRole)).toBe(false);
    });
  });
});
