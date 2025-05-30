import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
interface ApiFarmer {
  id: string;
  farmer_id: string;
  phone_no: string;
  referral_id: string | null;
  name: string | null;
  village: string | null;
  status: number | null;
  created_at: string;
  updated_at: string;
}

interface Farmer {
  id: string;
  name: string;
  phone: string;
  gender: string;
  city: string;
  createdOn: string;
  status: string;
  approval: string;
  amount: string;
}

const Farmers = () => {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<Farmer[]>([]); // Initialize with empty array and specify type
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [farmersPerPage, setFarmersPerPage] = useState(100); // Display 100 farmers per page by default

  useEffect(() => {
    const token = localStorage.getItem("keycloak-token");
    if (!token) {
      navigate("/"); // Redirect to login page if no token is found
      return;
    }

    const fetchFarmers = async () => {
      const token = localStorage.getItem("keycloak-token");

      if (!token) {
        setError("No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      try {        // Log the token before making the request to verify it's retrieved
        console.log("Auth Token:", token);

        // Make the API request with the Authorization header
        const response = await axios.get("https://dev-api.farmeasytechnologies.com/api/farmers/", { headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            per_page: farmersPerPage,
          },
        });

        // Adjust the data mapping to match the API response structure
        const fetchedFarmers = response.data.data.map((farmer: ApiFarmer) => ({
          id: farmer.id,
          name: farmer.name || "N/A", // Handle cases where name is null
          gender: "N/A", // Gender is not present in the API response
          phone: farmer.phone_no,
          city: farmer.village || "N/A", // Assuming 'village' maps to city
          createdOn: new Date(farmer.created_at).toLocaleDateString(), // Format the date
          status: getStatusText(farmer.status), // Function to convert status code to text
          approval: "N/A", // Approval is not present in the API response
          amount: "N/A", // Amount is not present in the API response
          // You might need to fetch additional details for gender, approval, and amount
        }));

        setFarmers(fetchedFarmers);
      } catch (err) {
        // Log the error for debugging
        console.error("Error fetching farmers:", err);
        setError("Failed to fetch farmer data. Check token or permissions.");

      } finally { 
        setLoading(false);
      }
    };

    fetchFarmers(); // Fetch farmers whenever currentPage or farmersPerPage changes
  }, [currentPage, farmersPerPage, navigate]); // Add navigate to dependency array

  // Function to convert status code to text
  const getStatusText = (status: Number|null) => {
    switch (status) {
      case 1:
        return "Lead";
      case 2:
        return "Contacted";
      // Add more status mappings as needed based on your API documentation
      default:
        return "Unknown";
    }
  };

  const filteredFarmers = farmers.filter((farmer) => // Filter on the current page's farmers
    (farmer.name && farmer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    farmer.phone.includes(searchQuery));

  const indexOfLastFarmer = currentPage * farmersPerPage; // Calculate index of last farmer on the current page
  const indexOfFirstFarmer = indexOfLastFarmer - farmersPerPage;
  const currentFarmers = filteredFarmers.slice(indexOfFirstFarmer, indexOfLastFarmer);
  const totalPages = Math.ceil(filteredFarmers.length / farmersPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">👨‍🌾 Farmer List</h1>

      {/* Filter section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <input
          placeholder="🔍 Search farmers"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 border border-blue-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700"
          value={farmersPerPage}
          onChange={(e) => {
            setFarmersPerPage(Number(e.target.value));
            setCurrentPage(1); // Reset to first page when farmers per page changes
          }}
         >
          <option value={10}>10 per page</option>
 <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
 </select>

        {/* Keep the status filter dropdown */}
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700">
          <option>All Statuses</option>
          {/* Add more status options based on your getStatusText function */}
          <option>Lead</option>
          <option>Contacted</option>
          {/* Add more status options based on your getStatusText function */}
        </select>
      </div>

      {/* Error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="text-gray-500">Loading farmers...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full text-sm text-left bg-white">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">City/Town</th>
                  <th className="px-4 py-3">Created On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Loan Amt.</th>
                  <th className="px-4 py-3 text-center">⋮</th>
                </tr>
              </thead>
              <tbody>
                {currentFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    onClick={() => navigate(`/farmers_applications/${farmer.id}`)}
                    className="hover:bg-blue-50 cursor-pointer border-b"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{farmer.name}</td>
                    <td className="px-4 py-3">{farmer.gender}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{farmer.phone}</td>
                    <td className="px-4 py-3">{farmer.city || "—"}</td>
                    <td className="px-4 py-3">{farmer.createdOn}</td>
                    <td className="px-4 py-3 text-yellow-600">{farmer.status}</td>
                    <td className="px-4 py-3">{farmer.approval}</td>
                    <td className="px-4 py-3">{farmer.amount || "—"}</td>
                    <td className="px-4 py-3 text-center text-xl text-gray-500">⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ⬅ Prev
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Farmers;