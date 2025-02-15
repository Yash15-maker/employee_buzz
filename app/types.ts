export interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    designation: string;
    status: 'Active' | 'Inactive';
    joiningDate: string;
    salary: number;
    skills: string[];
    legalEntity: string;
    subEntity: string;
}

export interface FilterData {
    departments: string[];
    designations: string[];
    skills: string[];
    legalEntities: string[];
    subEntities: {
        [key: string]: string[];
    };
}

export interface Filters {
    legalEntity: string;
    subEntity: string;
    department: string[];
    designation: string[];
    status: string[];
    skills: string[];
    salaryMin: string;
    salaryMax: string;
    salaryRange: string[];
}


export interface EmployeeTableProps {
    employees: Employee[] | null;
    fetchEmployees: (filters: Record<string, string | number>) => void;
    totalEmployees: number;
}
// export interface Filters {
//     legalEntity: string;
//     subEntity: string;
//     department: string[];
//     designation: string[];
//     status: string[];
//     skills: string[];
//     salaryMin: string;
//     salaryMax: string;
//     salaryRange: string[];
// }