import { accessibleProducts } from "./assistant";
import { useDemoRole } from "./demo-roles";
import { useUseCases } from "./use-cases";

/** Products visible to the current demo role; the client role only sees its own organization's products. */
export function useScopedUseCases() {
  const { role } = useDemoRole();
  return accessibleProducts(useUseCases(), role);
}
