import type { MenuItem } from '~/types/menu';

export const useMenuFilter = () => {
  const filterMenu = (menu: MenuItem[], activeFeatures: string[], userRole: string): MenuItem[] => {
    return menu
      .filter(item => {
        // 1. Capa Superior: Evaluación del Tenant
        if (item.requiredFeature && !activeFeatures.includes(item.requiredFeature)) {
          return false;
        }
        
        // 2. Capa Inferior: Evaluación del Rol
        const allowedRoles = item.allowedRoles || ['*'];
        const hasRole = allowedRoles.includes('*') || allowedRoles.includes(userRole);
        if (!hasRole) return false;

        return true;
      })
      .map(item => {
        // Recursividad para submenús
        if (item.children) {
          return { ...item, children: filterMenu(item.children, activeFeatures, userRole) };
        }
        return item;
      })
      // Eliminar categorías padre que se quedaron sin hijos tras el filtrado
      .filter(item => !item.children || item.children.length > 0); 
  };

  return { filterMenu };
};
