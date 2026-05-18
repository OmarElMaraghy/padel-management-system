using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PadelBackend.Data;
using PadelBackend.DTOs;
using PadelBackend.Models;

namespace PadelBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourtsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CourtsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Court>>> GetCourts()
    {
        var courts = await _context.Courts
            .OrderBy(c => c.Id)
            .ToListAsync();

        return Ok(courts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Court>> GetCourtById(int id)
    {
        var court = await _context.Courts.FindAsync(id);

        if (court == null)
        {
            return NotFound("Court not found.");
        }

        return Ok(court);
    }

    [HttpPost]
    public async Task<ActionResult<Court>> CreateCourt(CreateCourtRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Court name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Location))
        {
            return BadRequest("Court location is required.");
        }

        var court = new Court
        {
            Name = request.Name,
            Location = request.Location,
            IsActive = true
        };

        _context.Courts.Add(court);
        await _context.SaveChangesAsync();

        return Ok(court);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Court>> UpdateCourt(int id, UpdateCourtRequest request)
    {
        var court = await _context.Courts.FindAsync(id);

        if (court == null)
        {
            return NotFound("Court not found.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Court name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Location))
        {
            return BadRequest("Court location is required.");
        }

        court.Name = request.Name;
        court.Location = request.Location;
        court.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(court);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourt(int id)
    {
        var court = await _context.Courts.FindAsync(id);

        if (court == null)
        {
            return NotFound("Court not found.");
        }

        court.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok("Court deactivated successfully.");
    }
}