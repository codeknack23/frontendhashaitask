"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "New" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingLead, setEditingLead] = useState(null);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL; 

  
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchLeads() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/leads?page=${page}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeads(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [page, token, router, API_URL]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return router.push("/login");

    setSubmitting(true);
    try {
      let res;
      if (editingLead) {
        res = await axios.put(
          `${API_URL}/api/leads/${editingLead.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLeads(leads.map((l) => (l.id === editingLead.id ? res.data : l)));
        setEditingLead(null);
      } else {
        res = await axios.post(`${API_URL}/api/leads`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeads([res.data, ...leads]);
      }
      setForm({ name: "", email: "", phone: "", status: "New" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save lead");
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleDelete = async (id) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      await axios.delete(`${API_URL}/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(leads.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead");
    }
  };

  
  const handleEdit = (lead) => {
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
    });
    setEditingLead(lead);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading leads...</p>
      ) : leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <>
          <table className="w-full border border-gray-300 rounded overflow-hidden mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{lead.name}</td>
                  <td className="border px-4 py-2">{lead.email}</td>
                  <td className="border px-4 py-2">{lead.phone}</td>
                  <td className="border px-4 py-2">{lead.status}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-400 px-2 py-1 rounded"
                      onClick={() => handleEdit(lead)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 px-2 py-1 rounded text-white"
                      onClick={() => handleDelete(lead.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          
          <div className="flex justify-center gap-4 mb-6">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 w-full rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <select
          className="border p-2 w-full rounded"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>New</option>
          <option>In Progress</option>
          <option>Converted</option>
        </select>
        <button
          type="submit"
          className={`bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={submitting}
        >
          {submitting
            ? editingLead
              ? "Updating..."
              : "Adding Lead..."
            : editingLead
            ? "Update Lead"
            : "Add Lead"}
        </button>
      </form>
    </div>
  );
}
