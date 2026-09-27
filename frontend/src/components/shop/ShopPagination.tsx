import { usePathname, useRouter, useSearchParams } from '@/router/compat';
import { Pagination } from '@/components/ui/pagination';
import { buildSearchUrl } from '@/lib/searchParamsUtil';

interface ShopPaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
}

export function ShopPagination({ currentPage, totalPages }: ShopPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    router.push(buildSearchUrl(pathname, searchParams, { page: page > 1 ? String(page) : null }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onPageChange={goToPage}
      className="mt-14 border-t pt-8"
    />
  );
}
