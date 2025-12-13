export interface NavigationCategory {
    $id: string
    slug: string
    title: string
    description?: string
    icon?: string
    order: number
    parentSlug?: string
    showInNav: boolean
    navOrder: number
    hubContent?: string
    metaTitle?: string
    metaDescription?: string
}

export interface NavigationService {
    $id: string
    slug: string
    name: string
    shortDescription: string
    price: number
    category: string
    showInMegaMenu: boolean
    megaMenuOrder: number
    estimatedDays: string
}

export interface SubCategoryWithServices {
    category: NavigationCategory
    services: NavigationService[]
}

export interface ParentCategoryNav {
    category: NavigationCategory
    subCategories: SubCategoryWithServices[]
}

export interface MegaMenuData {
    parentCategories: ParentCategoryNav[]
}

export interface MegaMenuProps {
    data: MegaMenuData
}

export interface MegaMenuContentProps {
    parentCategory: NavigationCategory
    subCategories: SubCategoryWithServices[]
    onClose?: () => void
}

export interface SubCategoryListProps {
    subCategories: SubCategoryWithServices[]
    activeSubCategory: string | null
    onSubCategoryHover: (slug: string) => void
}

export interface ServicesListProps {
    services: NavigationService[]
    subCategory: NavigationCategory
}

export interface MobileNavProps {
    data: MegaMenuData
    isOpen: boolean
    onClose: () => void
}
