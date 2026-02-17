import { motion } from 'framer-motion'

const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }

  const CardSkeleton = () => (
    <div className="bg-white dark:bg-black rounded-[10px]  border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-[10px]"></div>
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
  )

  const TableSkeleton = () => (
    <div className="bg-white dark:bg-black rounded-[10px] shadow-xl  border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-black border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left">
                <div className="w-4 h-4 icon icon bg-gray-200 dark:bg-gray-700 rounded"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-black">
                <td className="px-6 py-4">
                  <div className="w-4 h-4 icon icon bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-[10px] w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-[10px] w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-[10px]"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-[10px]"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 icon icon bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-black rounded-[10px]  border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-[10px]"></div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const ListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-black rounded-[10px]  border-gray-200 dark:border-gray-700 p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-[10px]"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />
      case 'table':
        return <TableSkeleton />
      case 'grid':
        return <GridSkeleton />
      case 'list':
        return <ListSkeleton />
      default:
        return <CardSkeleton />
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div key={index} variants={itemVariants}>
          {renderSkeleton()}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default SkeletonLoader
