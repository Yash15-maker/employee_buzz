'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'react-use';
import { Table, Input, Button, Space, Tag, Menu, Dropdown, Row, Col, Select, Form } from "antd";

import { Employee, EmployeeTableProps, FilterData, Filters } from '../types';
import { SearchOutlined, ReloadOutlined, SortAscendingOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { formatDate } from '../lib';

const FILTERS_API = 'https://held-aeolian-orbit.glitch.me/api/filters';
const FILTERS_EMPLOYEE = 'https://held-aeolian-orbit.glitch.me/api/employees';


export default function EmployeeDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [employees, setEmployees] = useState<Employee[] | null>(null);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [isOpen, setIsOpen] = useState(true);
    const [pageSize, setPageSize] = useState<number>(10);
    const [apply, setApply] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        legalEntity: searchParams.get('legalEntity') || '',
        subEntity: searchParams.get('subEntity') || '',
        department: searchParams.get('department')?.split(',') || [],
        designation: searchParams.get('designation')?.split(',') || [],
        status: searchParams.get('status')?.split(',') || [],
        skills: searchParams.get('skills')?.split(',') || [],
        salaryMin: searchParams.get('salaryMin') || '',
        salaryMax: searchParams.get('salaryMax') || '',
        salaryRange: searchParams.get('salaryRange')?.split(',') || [],
    });
    const [filterData, setFilterData] = useState<FilterData>({
        departments: [],
        designations: [],
        skills: [],
        legalEntities: [],
        subEntities: {},
    });
    const [availableSubEntities, setAvailableSubEntities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    useEffect(() => {
        if (filters.legalEntity && filterData.subEntities) {
            setAvailableSubEntities(filterData.subEntities[filters.legalEntity] || []);
        } else {
            setAvailableSubEntities([]);
        }
    }, [filters.legalEntity, filterData.subEntities]);


    useEffect(() => {
        fetchFilterData();
    }, []);

    const fetchEmployees = async (appliedFilters: Filters) => {
        setLoading(true);
        const queryParams = new URLSearchParams(
            Object.entries(appliedFilters).reduce((acc: Record<string, string>, [key, value]) => {
                if (Array.isArray(value)) acc[key] = value.join(",");
                else acc[key] = value;
                return acc;
            }, {})
        ).toString();
        const response = await fetch(`${FILTERS_EMPLOYEE}?${queryParams}`);
        const result = await response.json();
        setEmployees(result.employees);
        setTotalEmployees(result.totalEmployees);
        setLoading(false);
    };


    useEffect(() => {
        if (apply) {
            fetchEmployees(filters);
            setApply(false);
        }
    }, [apply, page]);

    const fetchFilterData = async () => {
        try {
            const response = await fetch(FILTERS_API);
            const data = await response.json();
            setFilterData(data);
        } catch (error) {
            console.error('Error fetching filter data:', error);
        }
    };

    const handleLegalEntityChange = (value: any) => {
        onFilterChange('legalEntity', value);
        onFilterChange('subEntity', '');
    };
    const updateURL = (updates: Partial<Filters & { page?: number; sort?: string; order?: string }>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value && ((typeof value === 'string' || Array.isArray(value)) && value.length > 0)) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        router.push(`/?${params.toString()}`);
    };

    const resetFilters = () => {
        const emptyFilters: Filters = {
            legalEntity: '',
            subEntity: '',
            department: [],
            designation: [],
            status: [],
            skills: [],
            salaryMin: '',
            salaryMax: '',
            salaryRange: [],
        };
        setFilters(emptyFilters);
        setApply(false)

        fetchEmployees({
            legalEntity: searchParams.get('legalEntity') || '',
            subEntity: searchParams.get('subEntity') || '',
            department: searchParams.get('department')?.split(',') || [],
            designation: searchParams.get('designation')?.split(',') || [],
            status: searchParams.get('status')?.split(',') || [],
            skills: searchParams.get('skills')?.split(',') || [],
            salaryMin: searchParams.get('salaryMin') || '',
            salaryMax: searchParams.get('salaryMax') || '',
            salaryRange: searchParams.get('salaryRange')?.split(',') || [],
        });

        setPage(1);
        router.push('/');
    };
    const applyFilters = () => {
        setApply(true)
        setPage(1);
    };

    const salaryRanges = [
        { label: 'Any salary range', value: 'any' },
        { label: '₹0 - ₹10,000', value: '0-10000' },
        { label: '₹10,000 - ₹50,000', value: '10000-50000' },
        { label: '₹50,000 - ₹1,00,000', value: '50000-100000' },
        { label: '₹1,00,000 - ₹1,50,000', value: '100000-150000' },
        { label: 'Above ₹1,50,000', value: 'above-150000' }
    ];

    const onFilterChange = (filterName: keyof Filters, value: string | string[]) => {
        let newFilters = { ...filters };

        if (filterName === "salaryRange") {
            if (Array.isArray(value) && value.length > 0) {
                const numericRanges = value.map((val) => val.split('-').map(Number));
                const minSalary = Math.min(...numericRanges.map(([min]) => min));
                const maxSalary = Math.max(...numericRanges.map(([, max]) => max));

                newFilters.salaryMin = minSalary.toString();
                newFilters.salaryMax = maxSalary.toString();
            } else {
                newFilters.salaryMin = "";
                newFilters.salaryMax = "";
            }
            setFilters({
                ...newFilters,
                salaryRange: Array.isArray(value) ? value : [],
            });
            updateURL({
                ...newFilters,
                salaryRange: undefined,
                page: 1,
            });
        } else {
            setFilters((prevFilters) => ({
                ...prevFilters,
                [filterName]: Array.isArray(value) ? value : value ? [value] : [],
            }));
            updateURL({ ...newFilters, page: 1 });
        }

        setPage(1);
    };

    return (
        <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
                <div className='w-full'>
                    <div className="mb-6 p-3 lg:p-6 border border-gray-400 rounded-lg">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                            <h2 className="text-md font-semibold">Filters</h2>
                            {isOpen ? <UpOutlined /> : <DownOutlined />}
                        </div>
                        {isOpen && (
                            <Form layout="vertical" className="mt-4">
                                <Row gutter={16}>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="Legal Entities">
                                            <Select
                                                placeholder="All Legal Entities"
                                                value={filters?.legalEntity}
                                                onChange={(value) => onFilterChange("legalEntity", value)}
                                                suffixIcon={<DownOutlined />}
                                                style={{ width: "100%" }}
                                            >
                                                <Select.Option value="">All Legal Entities</Select.Option>
                                                {filterData.legalEntities?.map((entity) => (
                                                    <Select.Option key={entity} value={entity}>
                                                        {entity}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="Department">
                                            <Select
                                                placeholder="All Departments"
                                                showSearch
                                                value={filters.department}
                                                onChange={(value) => onFilterChange("department", value)}
                                                optionFilterProp="children"
                                                suffixIcon={<DownOutlined />}
                                                style={{ width: "100%" }}
                                                mode="multiple"
                                            >
                                                <Select.Option value="">All Departments</Select.Option>
                                                {filterData?.departments?.map((dept) => (
                                                    <Select.Option key={dept} value={dept}>
                                                        {dept}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="Designation">
                                            <Select
                                                placeholder="All Designations"
                                                value={filters.designation}
                                                onChange={(value) => onFilterChange("designation", value)}
                                                optionFilterProp="children"
                                                suffixIcon={<DownOutlined />}
                                                style={{ width: "100%" }}
                                                mode="multiple"
                                            >
                                                <Select.Option value="">All Designations</Select.Option>
                                                {filterData?.designations.map((desig) => (
                                                    <Select.Option key={desig} value={desig}>
                                                        {desig}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="Skills">
                                            <Select
                                                mode="multiple"
                                                placeholder="Select skills"
                                                value={filters.skills}
                                                onChange={(value) => onFilterChange("skills", value)}
                                                optionFilterProp="children"
                                                showSearch
                                                style={{ width: "100%" }}
                                            >
                                                {filterData.skills.map((skill) => (
                                                    <Select.Option key={skill} value={skill}>
                                                        {skill}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="Status">
                                            <Select
                                                showSearch
                                                placeholder="All Status"
                                                mode="multiple"
                                                value={filters.status}
                                                onChange={(value) => onFilterChange("status", value)}
                                                suffixIcon={<DownOutlined />}
                                                optionFilterProp="children"
                                                style={{ width: "100%" }}
                                            >
                                                <Select.Option value="">All Status</Select.Option>
                                                <Select.Option value="Active">Active</Select.Option>
                                                <Select.Option value="Inactive">Inactive</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="Salary Range">
                                            <Select
                                                mode="multiple"
                                                placeholder="Select salary range"
                                                value={filters.salaryRange}
                                                onChange={(value) => onFilterChange("salaryRange", value)}
                                                style={{ width: "100%" }}
                                                maxTagCount="responsive"
                                                optionFilterProp="label"
                                            >
                                                {salaryRanges.map((range) => (
                                                    <Select.Option key={range.value} value={range.value} label={range.label}>
                                                        {range.label}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row justify="end">
                                    <Space>
                                        <Button onClick={resetFilters}>Reset to default</Button>
                                        <Button type="primary" onClick={applyFilters}>Apply filters</Button>
                                    </Space>
                                </Row>
                            </Form>
                        )}
                    </div>
                    <EmployeeTable employees={employees} fetchEmployees={fetchEmployees} totalEmployees={totalEmployees} setPage={setPage} setPageSize={setPageSize} pageSize={pageSize} page={page} />
                </div>
            </ div>
        </div >
    );
}

const EmployeeTable = ({ employees, fetchEmployees, totalEmployees, setPage, setPageSize, pageSize, page }: any) => {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<string>("");
    const [sortedEmployees, setSortedEmployees] = useState<Employee[]>(employees);
    const handleSortChange = ({ key }: { key: string }) => {
        setSortOrder(key);
    };
    const sortMenu = (
        <Menu onClick={handleSortChange}>
            <Menu.Item key="name-asc">A-Z</Menu.Item>
            <Menu.Item key="name-desc">Z-A</Menu.Item>
            <Menu.Item key="salary-asc">Low - High</Menu.Item>
            <Menu.Item key="salary-desc">High - Low</Menu.Item>
            <Menu.Item key="joiningDate-asc">Oldest First</Menu.Item>
            <Menu.Item key="joiningDate-desc">Newest First</Menu.Item>
        </Menu>
    );
    const handleSearch = (e: any) => {
        setSearch(e.target.value);
        setPage(1)
    };
    useEffect(() => {
        if (!employees || !Array.isArray(employees)) {
            setSortedEmployees([]);
            return;
        }

        let sortedData = [...employees];
        if (sortOrder === "name-asc") {
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === "name-desc") {
            sortedData.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortOrder === "salary-asc") {
            sortedData.sort((a, b) => a.salary - b.salary);
        } else if (sortOrder === "salary-desc") {
            sortedData.sort((a, b) => b.salary - a.salary);
        } else if (sortOrder === "joiningDate-asc") {
            sortedData.sort((a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime());
        } else if (sortOrder === "joiningDate-desc") {
            sortedData.sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime());
        }
        setSortedEmployees(sortedData);
    }, [sortOrder, employees]);
    useEffect(() => {
        fetchEmployees({ page, pageSize });
    }, [page, pageSize]);

    const filteredEmployees = employees?.filter((employee: any) =>
        employee.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        setSortedEmployees(filteredEmployees);
    }, [search]);
    const handleTableChange = (pagination: any) => {
        setPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Department",
            dataIndex: "department",
            key: "department",
        },
        {
            title: "Designation",
            dataIndex: "designation",
            key: "designation",
        },
        {
            title: "Joining Date",
            dataIndex: "joiningDate",
            key: "joiningDate",
            render: (date: any) => formatDate(date),
        },
        {
            title: "Salary",
            dataIndex: "salary",
            key: "salary",
            render: (salary: any) => `$${salary.toLocaleString()}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: any) => (
                <Tag color={status === "Active" ? "green" : "volcano"}>{status}</Tag>
            ),
        },
        {
            title: "Skills",
            dataIndex: "skills",
            key: "skills",
            render: (skills: any) => (
                <>
                    {skills.map((skill: any) => (
                        <Tag key={skill} color="blue">
                            {skill}
                        </Tag>
                    ))}
                </>
            ),
        },

    ];

    return (
        <div className="p-6 w-full max-w-7xl mx-auto flex flex-col gap-3 justify-between">
            <div className='flex md:flex-row flex-col gap-3 md:gap-0 w-full justify-between'>
                <h2 className='text-md my-auto text-gray-700 font-semibold flex gap-2'>Employees
                    <div className='text-xs my-auto border text-gray-500 border-gray-300 rounded-xl px-2 py-1'>
                        {" "}{totalEmployees} selected
                    </div>
                </h2>
                <Input
                    placeholder="Search Employees"
                    value={search}
                    onChange={handleSearch}
                    prefix={<SearchOutlined />}
                    className='w-fit'
                />
                <Dropdown overlay={sortMenu} trigger={["click"]}>
                    <Button type="primary" icon={<SortAscendingOutlined />}>Sort</Button>
                </Dropdown>
            </div>
            <div className='overflow-x-auto'>
                <Table
                    dataSource={sortedEmployees}
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: totalEmployees,

                    }}
                    onChange={(pagination) => handleTableChange(pagination)}
                />
            </div>
        </div>
    );
};
