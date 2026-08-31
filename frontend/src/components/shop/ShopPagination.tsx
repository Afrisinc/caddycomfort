import { useRouter, usePathname, useSearchParams } from '@/router/compat';
import { Button } from '@/components/ui/button';
import { buildSearchUrl } from '@/lib/searchParamsUtil';

export function ShopPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    router.push(
      buildSearchUrl(pathname, searchParams, { page: page > 1 ? page.toString() : null }),
    );
  };

  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => goToPage(page)}
            className={currentPage === page ? 'bg-accent-rose hover:bg-accent-rose-dark' : ''}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </nav>
    </div>
  );
}
