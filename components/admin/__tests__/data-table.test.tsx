import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable, type DataTableColumn, type PaginationInfo } from '../data-table'

// 测试数据类型
interface TestItem {
  id: string
  name: string
  value: number
  status: string
}

// 测试列定义
const testColumns: DataTableColumn<TestItem>[] = [
  { key: 'name', title: '名称' },
  { key: 'value', title: '数值', sortable: true },
  { key: 'status', title: '状态' }
]

// 生成测试数据
function generateTestData(count: number): TestItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    value: i * 10,
    status: i % 2 === 0 ? 'active' : 'inactive'
  }))
}

describe('DataTable', () => {
  describe('基础渲染', () => {
    it('should render table with data', () => {
      const data = generateTestData(3)
      render(<DataTable data={data} columns={testColumns} />)

      expect(screen.getByText('名称')).toBeInTheDocument()
      expect(screen.getByText('Item 0')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render empty message when no data', () => {
      render(<DataTable data={[]} columns={testColumns} emptyMessage="没有数据" />)
      expect(screen.getByText('没有数据')).toBeInTheDocument()
    })

    it('should render loading state', () => {
      render(<DataTable data={[]} columns={testColumns} loading={true} />)
      // 加载状态下应该有表格结构
      const table = document.querySelector('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('Property Tests - 分页计算正确性', () => {
    /**
     * Property 5: 分页计算正确性
     * totalPages = ceil(total / pageSize)
     */
    it('should display correct pagination info', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),  // page
          fc.integer({ min: 1, max: 50 }),   // pageSize
          fc.integer({ min: 0, max: 1000 }), // total
          (page, pageSize, total) => {
            const totalPages = Math.ceil(total / pageSize) || 1
            const validPage = Math.min(page, totalPages)
            
            const pagination: PaginationInfo = {
              page: validPage,
              pageSize,
              total,
              totalPages
            }

            const data = generateTestData(Math.min(pageSize, total))
            const { container } = render(
              <DataTable data={data} columns={testColumns} pagination={pagination} />
            )

            // 验证分页信息显示
            if (totalPages > 1) {
              const paginationText = container.textContent
              expect(paginationText).toContain(`共 ${total} 条`)
              expect(paginationText).toContain(`第 ${validPage}/${totalPages} 页`)
            }

            // 清理
            container.remove()
          }
        ),
        { numRuns: 50 }
      )
    })

    /**
     * Property: 分页按钮状态正确性
     */
    it('should disable prev button on first page', () => {
      const pagination: PaginationInfo = { page: 1, pageSize: 10, total: 100, totalPages: 10 }
      render(<DataTable data={generateTestData(10)} columns={testColumns} pagination={pagination} />)

      const prevButton = screen.getByText('上一页').closest('button')
      expect(prevButton).toBeDisabled()
    })

    it('should disable next button on last page', () => {
      const pagination: PaginationInfo = { page: 10, pageSize: 10, total: 100, totalPages: 10 }
      render(<DataTable data={generateTestData(10)} columns={testColumns} pagination={pagination} />)

      const nextButton = screen.getByText('下一页').closest('button')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('选择功能', () => {
    it('should handle row selection', () => {
      const data = generateTestData(3)
      const onSelectionChange = vi.fn()

      render(
        <DataTable
          data={data}
          columns={testColumns}
          selectable={true}
          selectedIds={[]}
          onSelectionChange={onSelectionChange}
        />
      )

      // 点击第一行的复选框
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1]) // 第一个是全选，第二个是第一行

      expect(onSelectionChange).toHaveBeenCalledWith(['item-0'])
    })

    it('should handle select all', () => {
      const data = generateTestData(3)
      const onSelectionChange = vi.fn()

      render(
        <DataTable
          data={data}
          columns={testColumns}
          selectable={true}
          selectedIds={[]}
          onSelectionChange={onSelectionChange}
        />
      )

      // 点击全选复选框
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      expect(onSelectionChange).toHaveBeenCalledWith(['item-0', 'item-1', 'item-2'])
    })
  })

  describe('排序功能', () => {
    it('should call onSort when clicking sortable column', () => {
      const data = generateTestData(3)
      const onSort = vi.fn()

      render(
        <DataTable
          data={data}
          columns={testColumns}
          sortable={true}
          onSort={onSort}
        />
      )

      // 点击可排序的列
      fireEvent.click(screen.getByText('数值'))

      expect(onSort).toHaveBeenCalledWith('value', 'asc')
    })

    it('should toggle sort direction', () => {
      const data = generateTestData(3)
      const onSort = vi.fn()

      render(
        <DataTable
          data={data}
          columns={testColumns}
          sortable={true}
          sortState={{ key: 'value', direction: 'asc' }}
          onSort={onSort}
        />
      )

      fireEvent.click(screen.getByText('数值'))

      expect(onSort).toHaveBeenCalledWith('value', 'desc')
    })
  })

  describe('分页回调', () => {
    it('should call onPageChange when clicking next', () => {
      const onPageChange = vi.fn()
      const pagination: PaginationInfo = { page: 1, pageSize: 10, total: 100, totalPages: 10 }

      render(
        <DataTable
          data={generateTestData(10)}
          columns={testColumns}
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )

      fireEvent.click(screen.getByText('下一页'))

      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when clicking prev', () => {
      const onPageChange = vi.fn()
      const pagination: PaginationInfo = { page: 5, pageSize: 10, total: 100, totalPages: 10 }

      render(
        <DataTable
          data={generateTestData(10)}
          columns={testColumns}
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )

      fireEvent.click(screen.getByText('上一页'))

      expect(onPageChange).toHaveBeenCalledWith(4)
    })
  })
})
