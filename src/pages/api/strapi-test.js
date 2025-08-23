import { fetchHomepage } from "../../../lib/homepage";
import { fetchNavbar } from "../../../lib/navbar";

export default async function handler(req, res) {
  const data = await fetchHomepage();
  return res.status(200).json(data);
}
