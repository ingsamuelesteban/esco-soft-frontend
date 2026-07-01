export interface MenuItem {
  title: string;
  path: string;
  icon?: string;
  requiredFeature?: string;
  allowedRoles: string[];
  children?: MenuItem[];
}
