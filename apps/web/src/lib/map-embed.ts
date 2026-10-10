/**
 * Đổi link Google Maps admin nhập (thường là link rút gọn maps.app.goo.gl) thành link bản đồ nhúng được.
 * Link rút gọn không nhúng trực tiếp vào iframe được, nên mở nó ra link đầy đủ rồi lấy tên địa điểm:
 * nhúng theo tên thì Google hiện đúng ghim + thẻ thông tin cửa hàng (sao đánh giá, nút chỉ đường).
 * Không lấy được tên thì dùng toạ độ, cuối cùng mới dùng địa chỉ chữ.
 */
export async function getMapEmbedUrl(mapUrl: string, fallbackAddress: string): Promise<string | null> {
  const query = (mapUrl ? await placeQueryFromMapUrl(mapUrl) : null) ?? (fallbackAddress || null);
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=vi&z=16&output=embed` : null;
}

async function placeQueryFromMapUrl(mapUrl: string): Promise<string | null> {
  try {
    let fullUrl = mapUrl;
    if (/^https:\/\/(maps\.app\.goo\.gl|goo\.gl)\//.test(mapUrl)) {
      // Link rút gọn chỉ chuyển hướng; đọc header Location, lưu cache 1 ngày.
      const response = await fetch(mapUrl, { redirect: "manual", next: { revalidate: 86400 } });
      fullUrl = response.headers.get("location") ?? "";
    }
    const name = fullUrl.match(/\/maps\/place\/([^/@?]+)/)?.[1];
    if (name) return decodeURIComponent(name.replace(/\+/g, " "));
    const coords = fullUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ?? fullUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    return coords ? `${coords[1]},${coords[2]}` : null;
  } catch {
    return null;
  }
}
