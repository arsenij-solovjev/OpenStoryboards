package org.openstoryboards.socketserver.http;

import java.io.*;
import java.net.*;
import java.util.HashMap;
import java.util.Map;

public class HttpRequester {

	private Map<String, String> cookies = new HashMap<String, String>();

	public void setCookie(String name, String value) {
		cookies.put(name, value);
	}

	private void setupCookies(HttpURLConnection connection) {
		StringBuffer string = new StringBuffer();
		boolean first = true;
		for (String key : cookies.keySet()) {
			if (first) {
				first = false;
			} else {
				string.append("; ");
			}
			string.append(key);
			string.append("=");
			string.append(cookies.get(key));
		}
		connection.setRequestProperty("Cookie", string.toString());
	}

	public String get(String location) {
		URL url;
		HttpURLConnection conn;
		BufferedReader rd;
		String line;
		StringBuffer result = new StringBuffer();
		try {
			url = new URL(location);
			conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			setupCookies(conn);
			rd = new BufferedReader(
					new InputStreamReader(conn.getInputStream()));
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}
			rd.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return result.toString();
	}

	public String post(String location, Map<String, String> postData) {
		URL url;
		HttpURLConnection conn;
		BufferedReader rd;
		String line;
		// prepare post data
		boolean first = true;
		StringBuffer data = new StringBuffer();
		try {
			for (String key : postData.keySet()) {
				if (first)
					first = false;
				else
					data.append("&");
				data.append(URLEncoder.encode(key, "UTF-8"));
				data.append("=");
				data.append(URLEncoder.encode(postData.get(key), "UTF-8"));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		// send post request
		StringBuffer result = new StringBuffer();
		try {
			url = new URL(location);
			conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("POST");
			setupCookies(conn);

			conn.setDoOutput(true);
			OutputStreamWriter wr = new OutputStreamWriter(
					conn.getOutputStream());
			wr.write(data.toString());
			wr.flush();

			rd = new BufferedReader(
					new InputStreamReader(conn.getInputStream()));
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}
			rd.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return result.toString();
	}

	public static void main(String[] args) {
		// testing...
		HttpRequester req = new HttpRequester();
		req.setCookie("name", "Markus");
		System.out.println("Google");
		System.out.println(req.get("http://google.de"));
		System.out.println("OGame");
		System.out.println(req.post(
				"http://uni101.ogame.de/game/reg/login2.php",
				new HashMap<String, String>() {
					{
						put("login", "marksu");
						put("pass", "1223");
						put("is_utf8", "0");
						put("kid", "");
						put("uni_id", "");
						put("uni_url", "uni101.ogame.de");
						put("v", "2");
					}
				}));
	}
}
